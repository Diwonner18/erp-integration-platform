import React, { useState, useCallback, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useObras } from '@/hooks/useSupabaseData';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import {
  parseFile,
  autoMapColumns,
  TARGET_FIELDS,
  TARGET_LABELS,
  type ParsedFileResult,
  type ParsedSheet,
  type TargetType,
  type FieldMapping,
} from '@/lib/fileParser';
import {
  medicaoInsertSchema,
  despesaInsertSchema,
  horasExtrasInsertSchema,
  materialInsertSchema,
  epiInsertSchema,
} from '@/lib/validationSchemas';
import { z } from 'zod';

interface FileImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTargetType?: TargetType;
}

const ACCEPTED_EXTENSIONS = '.xlsx,.xls,.xlsm,.pdf';

const FileImportModal: React.FC<FileImportModalProps> = ({ open, onOpenChange, defaultTargetType }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: obrasData = [] } = useObras();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedFileResult | null>(null);
  const [activeSheet, setActiveSheet] = useState(0);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [targetType, setTargetType] = useState<TargetType>(defaultTargetType || 'despesas');
  const [obraId, setObraId] = useState('');
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [dragOver, setDragOver] = useState(false);

  const currentSheet: ParsedSheet | null = parsedData?.sheets[activeSheet] || null;

  const resetState = useCallback(() => {
    setStep(1);
    setParsing(false);
    setSaving(false);
    setParsedData(null);
    setActiveSheet(0);
    setSelectedRows(new Set());
    setTargetType(defaultTargetType || 'despesas');
    setObraId('');
    setColumnMapping({});
  }, [defaultTargetType]);

  const handleClose = () => {
    resetState();
    onOpenChange(false);
  };

  const handleFileSelect = async (file: File) => {
    setParsing(true);
    try {
      const result = await parseFile(file);
      if (!result.sheets.length || !result.sheets[0].rows.length) {
        toast({ title: 'Arquivo vazio', description: 'Nenhum dado encontrado no arquivo.', variant: 'destructive' });
        setParsing(false);
        return;
      }
      setParsedData(result);
      setActiveSheet(0);
      // Select all rows by default
      setSelectedRows(new Set(result.sheets[0].rows.map((_, i) => i)));
      setStep(2);
    } catch (err: any) {
      toast({ title: 'Erro ao ler arquivo', description: err.message, variant: 'destructive' });
    }
    setParsing(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleSheetChange = (idx: number) => {
    setActiveSheet(idx);
    if (parsedData) {
      setSelectedRows(new Set(parsedData.sheets[idx].rows.map((_, i) => i)));
    }
  };

  const toggleRow = (idx: number) => {
    setSelectedRows(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const toggleAll = () => {
    if (!currentSheet) return;
    if (selectedRows.size === currentSheet.rows.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(currentSheet.rows.map((_, i) => i)));
    }
  };

  const goToMapping = () => {
    if (!currentSheet) return;
    const mapping = autoMapColumns(currentSheet.headers, targetType);
    setColumnMapping(mapping);
    setStep(3);
  };

  const formatCellValue = (value: any): string => {
    if (value === null || value === undefined || value === '') return '-';
    if (typeof value === 'number') {
      if (Math.abs(value) >= 100 || (value % 1 !== 0)) {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
      }
      return String(value);
    }
    return String(value);
  };

  const needsObra = useMemo(() => {
    return ['medicoes', 'horas_extras', 'materiais', 'epis'].includes(targetType);
  }, [targetType]);

  const handleImport = async () => {
    if (!currentSheet) return;
    if (needsObra && !obraId) {
      toast({ title: 'Selecione uma obra', variant: 'destructive' });
      return;
    }

    const fields = TARGET_FIELDS[targetType];
    const requiredFields = fields.filter(f => f.required);
    const missingRequired = requiredFields.filter(f => !columnMapping[f.key]);
    if (missingRequired.length > 0) {
      toast({
        title: 'Mapeamento incompleto',
        description: `Campos obrigatórios sem mapeamento: ${missingRequired.map(f => f.label).join(', ')}`,
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const selectedData = currentSheet.rows.filter((_, i) => selectedRows.has(i));
      const records = selectedData.map(row => {
        const record: Record<string, any> = {};
        for (const [fieldKey, headerName] of Object.entries(columnMapping)) {
          if (headerName) {
            let value = row[headerName];
            // Convert numeric fields
            if (['valor', 'horas', 'quantidade', 'valor_unitario', 'percentual', 'valor_hora'].includes(fieldKey)) {
              value = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^\d.,-]/g, '').replace(',', '.')) || 0;
            }
            record[fieldKey] = value;
          }
        }
        if (needsObra) record.obra_id = obraId;

        // Set defaults for despesas
        if (targetType === 'despesas') {
          if (!record.data) record.data = new Date().toISOString().split('T')[0];
          if (!record.categoria) record.categoria = 'outro';
          if (obraId) record.obra_id = obraId;
        }
        if (targetType === 'horas_extras') {
          if (!record.data) record.data = new Date().toISOString().split('T')[0];
        }
        if (targetType === 'materiais') {
          if (!record.quantidade) record.quantidade = 1;
        }
        if (targetType === 'epis') {
          if (!record.quantidade) record.quantidade = 1;
        }

        return record;
      });

      if (records.length === 0) {
        toast({ title: 'Nenhuma linha selecionada', variant: 'destructive' });
        setSaving(false);
        return;
      }

      // Bulk insert
      const tableName = targetType === 'horas_extras' ? 'horas_extras' : targetType;
      const { error } = await supabase.from(tableName as any).insert(records as any);
      if (error) throw error;

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: [tableName] });
      if (targetType === 'medicoes') queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] });

      toast({
        title: 'Importação concluída!',
        description: `${records.length} registro(s) de ${TARGET_LABELS[targetType]} criados com sucesso.`,
      });
      handleClose();
    } catch (err: any) {
      toast({ title: 'Erro na importação', description: err.message, variant: 'destructive' });
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val) handleClose(); else onOpenChange(val); }}>
      <DialogContent className="sm:max-w-[900px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-primary" />
            Importar Arquivo
          </DialogTitle>
          <DialogDescription>
            {step === 1 && 'Selecione um arquivo Excel ou PDF para importar dados.'}
            {step === 2 && 'Revise os dados extraídos do arquivo.'}
            {step === 3 && 'Configure o mapeamento de colunas e confirme a importação.'}
          </DialogDescription>
        </DialogHeader>

        {/* Step indicators */}
        <div className="flex items-center gap-2 mb-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {step > s ? <CheckCircle className="w-4 h-4" /> : s}
              </div>
              {s < 3 && <div className={`w-8 h-0.5 ${step > s ? 'bg-primary' : 'bg-muted'}`} />}
            </div>
          ))}
          <span className="text-sm text-muted-foreground ml-2">
            {step === 1 ? 'Upload' : step === 2 ? 'Preview' : 'Mapeamento'}
          </span>
        </div>

        {/* STEP 1: Upload */}
        {step === 1 && (
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            {parsing ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-muted-foreground">Lendo arquivo...</p>
              </div>
            ) : (
              <>
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-foreground font-medium mb-2">Arraste e solte seu arquivo aqui</p>
                <p className="text-sm text-muted-foreground mb-4">ou clique para selecionar</p>
                <label>
                  <input
                    type="file"
                    accept={ACCEPTED_EXTENSIONS}
                    onChange={handleInputChange}
                    className="hidden"
                  />
                  <Button variant="outline" asChild>
                    <span>Selecionar Arquivo</span>
                  </Button>
                </label>
                <p className="text-xs text-muted-foreground mt-3">Formatos aceitos: .xlsx, .xls, .xlsm, .pdf</p>
              </>
            )}
          </div>
        )}

        {/* STEP 2: Preview */}
        {step === 2 && currentSheet && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{parsedData?.fileName}</Badge>
                <Badge variant="outline">{selectedRows.size} de {currentSheet.rows.length} linhas</Badge>
              </div>
            </div>

            {parsedData && parsedData.sheets.length > 1 && (
              <Tabs value={String(activeSheet)} onValueChange={(v) => handleSheetChange(Number(v))}>
                <TabsList>
                  {parsedData.sheets.map((sheet, i) => (
                    <TabsTrigger key={i} value={String(i)}>{sheet.sheetName}</TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            )}

            <div className="border rounded-lg overflow-auto max-h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox
                        checked={selectedRows.size === currentSheet.rows.length}
                        onCheckedChange={toggleAll}
                      />
                    </TableHead>
                    {currentSheet.headers.map((h, i) => (
                      <TableHead key={i} className="whitespace-nowrap">{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentSheet.rows.slice(0, 100).map((row, rowIdx) => (
                    <TableRow key={rowIdx} className={!selectedRows.has(rowIdx) ? 'opacity-40' : ''}>
                      <TableCell>
                        <Checkbox
                          checked={selectedRows.has(rowIdx)}
                          onCheckedChange={() => toggleRow(rowIdx)}
                        />
                      </TableCell>
                      {currentSheet.headers.map((h, colIdx) => (
                        <TableCell key={colIdx} className="whitespace-nowrap">
                          {formatCellValue(row[h])}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {currentSheet.rows.length > 100 && (
              <p className="text-xs text-muted-foreground text-center">
                Exibindo 100 de {currentSheet.rows.length} linhas
              </p>
            )}
          </div>
        )}

        {/* STEP 3: Mapping */}
        {step === 3 && currentSheet && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Tipo de Registro</Label>
                <Select value={targetType} onValueChange={(v) => {
                  setTargetType(v as TargetType);
                  setColumnMapping(autoMapColumns(currentSheet.headers, v as TargetType));
                }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(TARGET_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {needsObra && (
                <div>
                  <Label>Obra Destino *</Label>
                  <Select value={obraId} onValueChange={setObraId}>
                    <SelectTrigger><SelectValue placeholder="Selecione a obra" /></SelectTrigger>
                    <SelectContent>
                      {obrasData.map(o => (
                        <SelectItem key={o.id} value={o.id}>{o.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="border rounded-lg p-4 space-y-3">
              <p className="text-sm font-medium text-foreground">Mapeamento de Colunas</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TARGET_FIELDS[targetType].map((field) => (
                  <div key={field.key} className="flex items-center gap-2">
                    <Label className="min-w-[120px] text-xs">
                      {field.label} {field.required && <span className="text-destructive">*</span>}
                    </Label>
                    <Select
                      value={columnMapping[field.key] || '__none__'}
                      onValueChange={(v) => setColumnMapping(prev => ({ ...prev, [field.key]: v === '__none__' ? '' : v }))}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="—" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">— Não mapear —</SelectItem>
                        {currentSheet.headers.map(h => (
                          <SelectItem key={h} value={h}>{h}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {columnMapping[field.key] && (
                      <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  {selectedRows.size} registro(s) serão criados como {TARGET_LABELS[targetType]}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Verifique o mapeamento acima antes de confirmar a importação.
                </p>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep((step - 1) as 1 | 2 | 3)} disabled={saving}>
              <ArrowLeft className="w-4 h-4 mr-1" />Voltar
            </Button>
          )}
          <Button variant="outline" onClick={handleClose} disabled={saving}>Cancelar</Button>
          {step === 2 && (
            <Button onClick={goToMapping} disabled={selectedRows.size === 0}>
              Continuar<ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          )}
          {step === 3 && (
            <Button onClick={handleImport} disabled={saving}>
              {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Importando...</> : 'Criar Registros'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FileImportModal;
