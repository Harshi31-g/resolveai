'use client';

import { useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud, FileText, Image as ImageIcon, Mail, File,
  CheckCircle2, Loader2, X, ScanLine, Download, Trash2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { PageHeader } from '@/components/shared';
import { getDataset, removeEvidenceFile } from '@/lib/mock-data';
import { formatRelative } from '@/lib/fairness';
import type { EvidenceFile, FileType } from '@/lib/types';
import { toast } from 'sonner';

const FILE_ICON: Record<FileType, typeof FileText> = {
  pdf: FileText, image: ImageIcon, email: Mail, document: File,
};

interface UploadItem {
  id: string;
  name: string;
  size: number;
  type: FileType;
  progress: number;
  ocrProgress: number;
  ocrDone: boolean;
  extracted: { field: string; value: string; confidence: number }[];
}

const MOCK_EXTRACTIONS = [
  { field: 'Amount', value: '$349.99', confidence: 0.97 },
  { field: 'Date', value: 'Jul 14, 2024', confidence: 0.94 },
  { field: 'Merchant', value: 'TechNova Solutions', confidence: 0.91 },
  { field: 'Tracking Number', value: '1Z88429104', confidence: 0.95 },
  { field: 'Customer Name', value: 'Sarah Chen', confidence: 0.89 },
];

function EvidenceContent() {
  const searchParams = useSearchParams();
  const caseId = searchParams.get('case');
  const ds = getDataset();
  const initialEvidence = caseId
    ? ds.evidenceFiles.filter((e) => e.disputeId === caseId)
    : ds.evidenceFiles.slice(0, 12);
  const dispute = caseId ? ds.disputes.find((d) => d.id === caseId) : null;

  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [evidenceList, setEvidenceList] = useState<EvidenceFile[]>(initialEvidence);
  const [selected, setSelected] = useState<EvidenceFile | null>(initialEvidence[0] || null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleDeleteEvidence = (id: string, name: string) => {
    const ok = removeEvidenceFile(id);
    if (ok) {
      const updated = getDataset().evidenceFiles.filter((e) => e.disputeId === (caseId || ''));
      setEvidenceList(caseId ? updated : getDataset().evidenceFiles.slice(0, 12));
      if (selected?.id === id) setSelected(null);
      setRefreshKey((k) => k + 1);
      toast.success('Evidence deleted', { description: `${name} has been removed.` });
    } else {
      toast.error('Could not delete evidence file');
    }
  };

  const detectType = (name: string): FileType => {
    if (/\.(png|jpe?g|webp|gif)$/i.test(name)) return 'image';
    if (/\.eml|\.msg$/i.test(name)) return 'email';
    if (/\.pdf$/i.test(name)) return 'pdf';
    return 'document';
  };

  const handleFiles = useCallback((files: FileList | File[]) => {
    const arr = Array.from(files);
    arr.forEach((file, idx) => {
      const id = `up_${Date.now()}_${idx}`;
      const type = detectType(file.name);
      const item: UploadItem = {
        id, name: file.name, size: file.size, type,
        progress: 0, ocrProgress: 0, ocrDone: false,
        extracted: [],
      };
      setUploads((prev) => [...prev, item]);

      // Simulate upload progress
      let p = 0;
      const upInt = setInterval(() => {
        p += Math.random() * 25 + 15;
        if (p >= 100) {
          p = 100;
          clearInterval(upInt);
          // Start OCR
          let o = 0;
          const ocrInt = setInterval(() => {
            o += Math.random() * 20 + 10;
            if (o >= 100) {
              o = 100;
              clearInterval(ocrInt);
              setUploads((prev) => prev.map((u) =>
                u.id === id ? { ...u, ocrProgress: 100, ocrDone: true, extracted: MOCK_EXTRACTIONS.slice(0, Math.floor(Math.random() * 3) + 3) } : u
              ));
              toast.success('OCR extraction complete', { description: `${file.name} processed successfully.` });
            } else {
              setUploads((prev) => prev.map((u) => u.id === id ? { ...u, ocrProgress: o } : u));
            }
          }, 200);
        } else {
          setUploads((prev) => prev.map((u) => u.id === id ? { ...u, progress: p } : u));
        }
      }, 150);
    });
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
  };

  const removeUpload = (id: string) => setUploads((prev) => prev.filter((u) => u.id !== id));

  const groupBy = (arr: EvidenceFile[], key: (e: EvidenceFile) => string) => {
    const map: Record<string, EvidenceFile[]> = {};
    arr.forEach((e) => { const k = key(e); (map[k] = map[k] || []).push(e); });
    return map;
  };

  const grouped = groupBy(evidenceList, (e) => e.source);

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      <PageHeader
        title="Evidence Management"
        description={dispute ? `Evidence for ${dispute.caseNumber}` : 'Upload, parse, and review evidence files'}
        actions={<Button variant="outline" size="sm"><Download className="mr-1.5 h-4 w-4" /> Export all</Button>}
      />

      <div className="grid lg:grid-cols-[1fr_360px] gap-4">
        {/* Left: Upload + list */}
        <div className="space-y-4">
          {/* Dropzone */}
          <Card>
            <CardContent className="p-0">
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                className={`relative rounded-xl border-2 border-dashed m-4 p-10 text-center transition-all ${
                  dragOver ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-border hover:border-primary/50'
                }`}
              >
                <input
                  type="file" multiple
                  accept=".pdf,.png,.jpg,.jpeg,.eml,.doc,.docx"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) => e.target.files && handleFiles(e.target.files)}
                />
                <motion.div
                  animate={dragOver ? { y: -4, scale: 1.05 } : { y: 0, scale: 1 }}
                  className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"
                >
                  <UploadCloud className="h-7 w-7" />
                </motion.div>
                <p className="mt-4 font-medium">Drag and drop evidence files here</p>
                <p className="text-sm text-muted-foreground mt-1">PDF, images, invoices, receipts, tracking, emails — up to 25MB</p>
                <Button className="mt-4" size="sm" variant="outline">Browse files</Button>
              </div>
            </CardContent>
          </Card>

          {/* Upload progress */}
          <AnimatePresence>
            {uploads.map((u) => {
              const Icon = FILE_ICON[u.type];
              return (
                <motion.div
                  key={u.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                          <Icon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium truncate">{u.name}</span>
                            <button onClick={() => removeUpload(u.id)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
                          </div>
                          <div className="text-xs text-muted-foreground">{(u.size / 1024).toFixed(0)} KB</div>
                          {u.progress < 100 ? (
                            <div className="mt-2"><Progress value={u.progress} className="h-1.5" /><span className="text-xs text-muted-foreground">Uploading… {Math.round(u.progress)}%</span></div>
                          ) : u.ocrDone ? (
                            <div className="mt-2 flex items-center gap-2 text-xs text-success"><CheckCircle2 className="h-3.5 w-3.5" /> OCR complete — {u.extracted.length} entities extracted</div>
                          ) : (
                            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Running OCR extraction… {Math.round(u.ocrProgress)}%</div>
                          )}
                        </div>
                      </div>
                      {u.ocrDone && u.extracted.length > 0 && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 grid grid-cols-2 gap-2">
                          {u.extracted.map((e) => (
                            <div key={e.field} className="rounded-lg border bg-muted/30 px-3 py-2">
                              <div className="text-xs text-muted-foreground">{e.field}</div>
                              <div className="text-sm font-medium">{e.value}</div>
                              <div className="mt-1 flex items-center gap-1.5">
                                <div className="h-1 flex-1 rounded-full bg-muted overflow-hidden">
                                  <div className="h-full bg-primary" style={{ width: `${e.confidence * 100}%` }} />
                                </div>
                                <span className="text-[10px] text-muted-foreground">{Math.round(e.confidence * 100)}%</span>
                              </div>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Evidence library grouped */}
          {Object.entries(grouped).map(([source, items]) => (
            <Card key={source}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm capitalize">{source} Evidence</CardTitle>
                  <Badge variant="outline">{items.length} files</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-2">
                  {items.map((ef) => {
                    const Icon = FILE_ICON[ef.type];
                    const active = selected?.id === ef.id;
                    return (
                      <div key={ef.id} className="relative group">
                        <button
                          onClick={() => setSelected(ef)}
                          className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all ${active ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:border-primary/40'}`}
                        >
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted shrink-0">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{ef.name}</div>
                            <div className="text-xs text-muted-foreground">{(ef.size / 1024).toFixed(0)} KB · {formatRelative(ef.uploadedAt)}</div>
                            <div className="flex items-center gap-1.5 mt-1">
                              <Badge variant="outline" className="text-[9px] py-0 capitalize">{ef.evidenceType}</Badge>
                              <Badge variant="outline" className={`text-[9px] py-0 ${ef.ocrStatus === 'complete' ? 'text-success' : 'text-warning'}`}>
                                {ef.ocrStatus}
                              </Badge>
                            </div>
                          </div>
                        </button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button
                              className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all"
                              aria-label="Delete evidence"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete evidence file?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently remove "{ef.name}" from the case. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => handleDeleteEvidence(ef.id, ef.name)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Right: OCR detail */}
        <div className="space-y-4">
          <Card className="lg:sticky lg:top-20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><ScanLine className="h-5 w-5" /></div>
                <div>
                  <CardTitle className="text-sm">OCR Extraction</CardTitle>
                  <CardDescription>Extracted entities & confidence</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {!selected ? (
                <p className="text-sm text-muted-foreground">Select a file to view extracted entities.</p>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                  <div className="rounded-lg border bg-muted/30 p-3">
                    <div className="text-xs text-muted-foreground">File</div>
                    <div className="text-sm font-medium truncate">{selected.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">Uploaded by {selected.uploadedBy} · {formatRelative(selected.uploadedAt)}</div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">OCR Confidence</span>
                    <span className={`text-sm font-bold ${selected.ocrConfidence > 0.9 ? 'text-success' : selected.ocrConfidence > 0.75 ? 'text-warning' : 'text-destructive'}`}>
                      {Math.round(selected.ocrConfidence * 100)}%
                    </span>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">Extracted Entities</div>
                    {selected.extractedEntities.map((e) => (
                      <div key={e.field} className="rounded-lg border px-3 py-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">{e.field}</span>
                          <Badge variant="outline" className="text-[9px] py-0">{Math.round(e.confidence * 100)}%</Badge>
                        </div>
                        <div className="text-sm font-medium mt-0.5">{e.value}</div>
                        <div className="mt-1 h-1 rounded-full bg-muted overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${e.confidence * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Separator() {
  return <div className="h-px bg-border" />;
}

export default function EvidencePage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Loading…</div>}>
      <EvidenceContent />
    </Suspense>
  );
}
