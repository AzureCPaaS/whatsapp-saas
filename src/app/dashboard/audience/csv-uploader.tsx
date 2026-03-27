"use client";

import { useState, useRef } from "react";
import Papa from "papaparse";
import { UploadCloud, FileType, CheckCircle, X, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { bulkAddContacts, ContactImportRecord } from "@/app/actions/audience";

export default function CsvUploader({ onComplete }: { onComplete?: () => void }) {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [parsedRecords, setParsedRecords] = useState<ContactImportRecord[] | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleFile = (file: File) => {
        if (!file.name.endsWith('.csv')) {
            toast.error("Please upload a valid .csv file");
            return;
        }

        setFileName(file.name);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const validRecords: ContactImportRecord[] = [];
                let invalidCount = 0;

                results.data.forEach((row: any) => {
                    // Try to guess the column names (case-insensitive)
                    const nameKey = Object.keys(row).find(k => k.toLowerCase().includes('name'));
                    const phoneKey = Object.keys(row).find(k => k.toLowerCase().includes('phone') || k.toLowerCase().includes('number'));
                    const tagKey = Object.keys(row).find(k => k.toLowerCase().includes('tag'));

                    if (nameKey && phoneKey && row[nameKey] && row[phoneKey]) {
                        // Extract tags if present (comma separated string)
                        let tags = ["Imported"];
                        if (tagKey && row[tagKey]) {
                            const customTags = String(row[tagKey]).split(',').map(t => t.trim()).filter(Boolean);
                            if (customTags.length > 0) tags = customTags;
                        }

                        // Clean phone number (strip spaces, dashes, parentheses)
                        const rawPhone = String(row[phoneKey]);
                        const cleanedPhone = rawPhone.replace(/[\s\-\(\)]/g, '');

                        // We assume strict formatting for production, but this catches basic errors
                        validRecords.push({
                            name: String(row[nameKey]).trim(),
                            phone: cleanedPhone,
                            tags
                        });
                    } else {
                        invalidCount++;
                    }
                });

                setParsedRecords(validRecords);

                if (validRecords.length === 0) {
                    toast.error("No valid contacts found. Please ensure headers are 'Name' and 'Phone'.");
                    setParsedRecords(null);
                    setFileName(null);
                } else if (invalidCount > 0) {
                    toast.success(`Found ${validRecords.length} contacts. Skipped ${invalidCount} invalid rows.`);
                } else {
                    toast.success(`Successfully parsed ${validRecords.length} contacts!`);
                }
            },
            error: (error) => {
                toast.error("Failed to parse CSV: " + error.message);
                setFileName(null);
                setParsedRecords(null);
            }
        });
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    };

    const cancelImport = () => {
        setParsedRecords(null);
        setFileName(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const confirmUpload = async () => {
        if (!parsedRecords || parsedRecords.length === 0) return;

        setIsUploading(true);
        try {
            await bulkAddContacts(parsedRecords);
            toast.success(`Successfully imported ${parsedRecords.length} contacts!`);
            cancelImport();
            if (onComplete) onComplete();
        } catch (error: any) {
            toast.error(error.message || "Failed to import contacts to the database.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="glass-panel p-6 rounded-2xl w-full max-w-2xl border border-white/10">
            <h2 className="text-xl font-bold text-white mb-2">Bulk Import Contacts</h2>
            <p className="text-sm text-zinc-400 mb-6">Upload a CSV file with <code className="bg-white/10 px-1 py-0.5 rounded text-zinc-300">Name</code> and <code className="bg-white/10 px-1 py-0.5 rounded text-zinc-300">Phone</code> columns.</p>

            {!parsedRecords ? (
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${isDragging ? "border-[#25D366] bg-[#25D366]/5" : "border-white/20 hover:border-white/40 hover:bg-white/5"
                        }`}
                >
                    <input
                        type="file"
                        accept=".csv"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleInputChange}
                    />
                    <UploadCloud className={`mx-auto h-12 w-12 mb-4 ${isDragging ? "text-[#25D366]" : "text-zinc-500"}`} />
                    <p className="text-lg font-medium text-white mb-1">Click or drag CSV here</p>
                    <p className="text-sm text-zinc-500">Max file size 5MB</p>
                </div>
            ) : (
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="bg-[#25D366]/20 p-2 rounded-lg">
                                <FileType className="h-6 w-6 text-[#25D366]" />
                            </div>
                            <div>
                                <p className="text-white font-medium">{fileName}</p>
                                <p className="text-xs text-zinc-400">{parsedRecords.length} valid contacts ready</p>
                            </div>
                        </div>
                        <button onClick={cancelImport} className="p-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors">
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={cancelImport}
                            disabled={isUploading}
                            className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={confirmUpload}
                            disabled={isUploading}
                            className="flex-1 py-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-black font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-lg shadow-[#25D366]/20"
                        >
                            {isUploading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    <CheckCircle className="h-5 w-5" />
                                    Import Contacts
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
