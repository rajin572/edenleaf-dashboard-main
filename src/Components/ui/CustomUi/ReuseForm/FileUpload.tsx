import { useRef } from "react";
import { Upload, File } from "lucide-react";
import { ImagePreview } from "../ReuseImagePreview";
import { MdDelete } from "react-icons/md";

export interface FileWithPreview {
    file: File;
    preview: string;
}

interface FileUploadProps {
    value?: FileWithPreview[];
    onChange: (files: FileWithPreview[]) => void;
    maxFiles?: number;
    accept?: string;
    className?: string;
    "aria-invalid"?: boolean;
}

export const FileUpload = ({
    value = [],
    onChange,
    maxFiles = 5,
    accept = "image/*",
    className = "",
}: FileUploadProps) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);

        // If files exceed the max limit, show alert
        if (value.length + files.length > maxFiles) {
            alert(`Maximum ${maxFiles} files allowed`);
            return;
        }

        // Map files to include preview and file object
        const newFiles: FileWithPreview[] = files.map(file => ({
            file, // Ensure file data is included
            preview: URL.createObjectURL(file), // Create a preview URL for the image
        }));

        // Update the form with new files
        onChange([...value, ...newFiles]);
        console.log([...value, ...newFiles])

        // Reset input value to allow selecting the same file again
        if (inputRef.current) {
            inputRef.current.value = "";
        }
    };

    const removeFile = (index: number) => {
        const newFiles = [...value];
        // Clean up the object URL to prevent memory leaks
        URL.revokeObjectURL(newFiles[index].preview);
        newFiles.splice(index, 1);
        onChange(newFiles); // Update the value in react-hook-form
    };

    const isImage = (filename: string) => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(filename);

    const handleClick = () => {
        if (inputRef.current) {
            inputRef.current.click();
        }
    };

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Upload Button */}
            <button
                type="button"
                onClick={handleClick}
                className="flex flex-col items-center justify-center rounded-md border-2 border-dashed border-secondary-color bg-base-color/5 p-6 cursor-pointer hover:bg-base-color/10 transition-colors"
            >
                <Upload className="size-8 mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                    Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                    {value.length}/{maxFiles} files uploaded
                </p>
            </button>

            {/* Hidden Input */}
            <input
                ref={inputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept={accept}
                multiple={maxFiles > 1}

            />

            {/* Preview Grid */}
            {value.length > 0 && (
                <div className="flex gap-4">
                    {value.map((item, index) => (
                        <div
                            key={index}
                            className="relative p-2 group rounded-md border border-secondary-color bg-base-color/5 overflow-hidden w-fit flex items-center justify-center gap-2"
                        >
                            {/* Preview */}
                            <div className="flex items-center justify-center">
                                {isImage(item.file.name) ? (
                                    <ImagePreview
                                        src={item.preview}
                                        alt={item.file.name}
                                        className="w-10 h-10 object-cover"
                                    />
                                ) : (
                                    <File className="size-12 text-muted-foreground" />
                                )}
                            </div>

                            {/* File Info */}
                            <div className="">
                                <p className="text-xs font-medium truncate" title={item.file.name}>
                                    {item.file.name?.slice(0, 40)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {(item.file.size / 1024).toFixed(1)} KB
                                </p>
                            </div>

                            {/* Remove Button */}

                            <MdDelete onClick={(e) => {
                                e.stopPropagation();
                                removeFile(index);
                            }}
                                className="size-4 text-error opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
