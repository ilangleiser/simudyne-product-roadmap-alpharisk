import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useEpics } from "@/contexts/EpicContext";
import { RoadmapItem, Quarter } from "@/types/epic";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Upload, FileSpreadsheet, Check, AlertCircle, X } from "lucide-react";
import Papa from "papaparse";
import * as XLSX from "xlsx";

interface ColumnMapping {
  epic: string;
  sprint: string;
  quarter: string;
  feature: string;
  description: string;
  customer: string;
  startDate: string;
  endDate: string;
  module: string;
}

const REQUIRED_FIELDS = ["epic", "sprint", "quarter", "feature", "description"] as const;

export default function ImportPage() {
  const navigate = useNavigate();
  const { importRoadmapItems } = useEpics();
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [previewData, setPreviewData] = useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>({
    epic: "",
    sprint: "",
    quarter: "",
    feature: "",
    description: "",
    customer: "",
    startDate: "",
    endDate: "",
    module: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const parseExcelFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<Record<string, string>>(worksheet, {
          defval: "",
        });

        if (jsonData.length === 0) {
          toast.error("No data found in the Excel file");
          return;
        }

        const parsedHeaders = Object.keys(jsonData[0]);
        setHeaders(parsedHeaders);
        setPreviewData(jsonData.slice(0, 10));
        autoMapColumns(parsedHeaders);
        toast.success("Excel file loaded successfully");
      } catch (error) {
        toast.error("Error parsing Excel file: " + (error as Error).message);
      }
    };
    reader.onerror = () => {
      toast.error("Error reading file");
    };
    reader.readAsArrayBuffer(file);
  };

  const parseCsvFile = (file: File) => {
    Papa.parse(file, {
      header: true,
      preview: 10,
      skipEmptyLines: true,
      delimitersToGuess: [',', '\t', ';', '|'],
      complete: (results) => {
        if (results.errors.length > 0) {
          const criticalErrors = results.errors.filter(
            (err) => err.type !== 'FieldMismatch'
          );
          if (criticalErrors.length > 0) {
            toast.error("Error parsing file: " + criticalErrors[0].message);
            return;
          }
        }

        const parsedHeaders = results.meta.fields || [];
        setHeaders(parsedHeaders);
        setPreviewData(results.data as Record<string, string>[]);
        autoMapColumns(parsedHeaders);
        toast.success("CSV file loaded successfully");
      },
      error: (error) => {
        toast.error("Error reading file: " + error.message);
      },
    });
  };

  const autoMapColumns = (parsedHeaders: string[]) => {
    const autoMapping: Partial<ColumnMapping> = {};
    parsedHeaders.forEach((header) => {
      const lowerHeader = header.toLowerCase();
      if (lowerHeader.includes("epic")) autoMapping.epic = header;
      if (lowerHeader.includes("sprint")) autoMapping.sprint = header;
      if (lowerHeader.includes("quarter") || lowerHeader === "q") autoMapping.quarter = header;
      if (lowerHeader.includes("feature")) autoMapping.feature = header;
      if (lowerHeader.includes("description") || lowerHeader.includes("desc"))
        autoMapping.description = header;
      if (lowerHeader.includes("customer") || lowerHeader.includes("client"))
        autoMapping.customer = header;
      if (lowerHeader.includes("start")) autoMapping.startDate = header;
      if (lowerHeader.includes("end")) autoMapping.endDate = header;
      if (lowerHeader.includes("module") || lowerHeader.includes("category"))
        autoMapping.module = header;
    });
    setMapping((prev) => ({ ...prev, ...autoMapping }));
  };

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const fileName = selectedFile.name.toLowerCase();
    if (!fileName.endsWith(".csv") && !fileName.endsWith(".xlsx") && !fileName.endsWith(".xls")) {
      toast.error("Please upload a CSV or Excel file");
      return;
    }

    setFile(selectedFile);

    if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
      parseExcelFile(selectedFile);
    } else {
      parseCsvFile(selectedFile);
    }
  }, []);

  const handleMappingChange = (field: keyof ColumnMapping, value: string) => {
    // Handle the "none" placeholder value
    const actualValue = value === "__none__" ? "" : value;
    setMapping((prev) => ({ ...prev, [field]: actualValue }));
  };

  const isValidMapping = () => {
    return REQUIRED_FIELDS.every((field) => mapping[field] !== "");
  };

  const normalizeQuarter = (value: string): Quarter => {
    const normalized = value.toUpperCase().replace(/[^Q1234]/g, "");
    if (["Q1", "Q2", "Q3", "Q4"].includes(normalized)) {
      return normalized as Quarter;
    }
    // Try to extract quarter from various formats
    if (value.includes("1")) return "Q1";
    if (value.includes("2")) return "Q2";
    if (value.includes("3")) return "Q3";
    if (value.includes("4")) return "Q4";
    return "Q1"; // Default
  };

  const handleImport = async () => {
    if (!file || !isValidMapping()) {
      toast.error("Please complete all required field mappings");
      return;
    }

    setIsProcessing(true);

    try {
      const fileName = file.name.toLowerCase();
      
      const processData = (data: Record<string, string>[]) => {
        const items: RoadmapItem[] = data
          .filter((row) => row[mapping.epic] && row[mapping.feature])
          .map((row) => ({
            epic: row[mapping.epic] || "",
            sprint: row[mapping.sprint] || "",
            quarter: normalizeQuarter(row[mapping.quarter] || "Q1"),
            feature: row[mapping.feature] || "",
            description: row[mapping.description] || "",
            customer: mapping.customer ? row[mapping.customer] : undefined,
            startDate: mapping.startDate ? row[mapping.startDate] : undefined,
            endDate: mapping.endDate ? row[mapping.endDate] : undefined,
            module: mapping.module ? row[mapping.module] : undefined,
          }));

        if (items.length === 0) {
          toast.error("No valid data found in file");
          setIsProcessing(false);
          return;
        }

        importRoadmapItems(items);
        toast.success(`Successfully imported ${items.length} items`);
        navigate("/epics");
      };

      if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = e.target?.result;
            const workbook = XLSX.read(data, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json<Record<string, string>>(worksheet, {
              defval: "",
            });
            processData(jsonData);
          } catch (error) {
            toast.error("Error processing Excel file: " + (error as Error).message);
            setIsProcessing(false);
          }
        };
        reader.onerror = () => {
          toast.error("Error reading file");
          setIsProcessing(false);
        };
        reader.readAsArrayBuffer(file);
      } else {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          delimitersToGuess: [',', '\t', ';', '|'],
          complete: (results) => {
            processData(results.data as Record<string, string>[]);
          },
          error: (error) => {
            toast.error("Error processing file: " + error.message);
            setIsProcessing(false);
          },
        });
      }
    } catch (error) {
      toast.error("Failed to import file");
      setIsProcessing(false);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) {
        const input = document.createElement("input");
        input.type = "file";
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(droppedFile);
        
        const event = {
          target: { files: dataTransfer.files },
        } as React.ChangeEvent<HTMLInputElement>;
        handleFileChange(event);
      }
    },
    [handleFileChange]
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <Card>
        <CardHeader>
          <CardTitle>Import Roadmap Data</CardTitle>
          <CardDescription>
            Upload your CSV or Excel file containing roadmap data. We'll help you map
            the columns to the required fields.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-12 text-center hover:border-muted-foreground/50 transition-colors"
          >
            {file ? (
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="h-10 w-10 text-accent" />
                <div className="text-left">
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setFile(null);
                    setHeaders([]);
                    setPreviewData([]);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Drop your file here</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  or click to browse
                </p>
                <Label htmlFor="file-upload">
                  <Button asChild variant="outline">
                    <span>
                      <Upload className="mr-2 h-4 w-4" />
                      Choose File
                    </span>
                  </Button>
                </Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {headers.length > 0 && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Map Columns</CardTitle>
              <CardDescription>
                Match your spreadsheet columns to the required fields. Required fields
                are marked with an asterisk.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Object.entries(mapping).map(([field, value]) => {
                  const isRequired = REQUIRED_FIELDS.includes(field as any);
                  return (
                    <div key={field} className="space-y-2">
                      <Label className="flex items-center gap-1">
                        {field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, " $1")}
                        {isRequired && <span className="text-destructive">*</span>}
                      </Label>
                      <Select value={value || "__none__"} onValueChange={(v) => handleMappingChange(field as keyof ColumnMapping, v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select column" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">None</SelectItem>
                          {headers.filter((header) => header && header.trim() !== "").map((header) => (
                            <SelectItem key={header} value={header}>
                              {header}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex items-center gap-4">
                {isValidMapping() ? (
                  <Badge className="bg-success text-success-foreground">
                    <Check className="mr-1 h-3 w-3" />
                    All required fields mapped
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <AlertCircle className="mr-1 h-3 w-3" />
                    Some required fields are missing
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preview Data</CardTitle>
              <CardDescription>
                Review the first few rows of your data before importing.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {headers.slice(0, 6).map((header) => (
                        <TableHead key={header}>{header}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewData.slice(0, 5).map((row, index) => (
                      <TableRow key={index}>
                        {headers.slice(0, 6).map((header) => (
                          <TableCell key={header} className="max-w-48 truncate">
                            {row[header]}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" onClick={() => navigate("/")}>
                  Cancel
                </Button>
                <Button onClick={handleImport} disabled={!isValidMapping() || isProcessing}>
                  {isProcessing ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Import Data
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
