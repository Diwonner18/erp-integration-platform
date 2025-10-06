import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Ruler, Calendar, DollarSign, Building, TrendingUp, Check, X, Receipt, AlertCircle } from 'lucide-react';

interface MedicaoDetailModalProps {
  medicao: any;
  isOpen: boolean;
  onClose: () => void;
  onAprovar?: (medicao: any) => void;
  onRejeitar?: (medicao: any) => void;
}

const MedicaoDetailModal = ({ 
  medicao, 
  isOpen, 
  onClose, 
  onAprovar, 
  onRejeitar 
}: MedicaoDetailModalProps) => {
  if (!medicao) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Ruler className="w-5 h-5 text-blue-600" />
            </div>
            <DialogTitle>Detalhes da Medição</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center gap-3">
              <Building className="w-4 h-4 text-slate-500" />
              <div>
                <p className="text-sm text-slate-500">Obra</p>
                <p className="font-medium">{medicao.obra}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-slate-500" />
              <div>
                <p className="text-sm text-slate-500">Período</p>
                <p className="font-medium">{medicao.periodo}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <TrendingUp className="w-4 h-4 text-slate-500" />
              <div>
                <p className="text-sm text-slate-500">Percentual Executado</p>
                <p className="font-medium">{medicao.percentual}%</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <DollarSign className="w-4 h-4 text-slate-500" />
              <div>
                <p className="text-sm text-slate-500">Valor</p>
                <p className="font-medium">{medicao.valor}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-slate-500" />
              <div>
                <p className="text-sm text-slate-500">Data da Medição</p>
                <p className="font-medium">{medicao.data}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-4 h-4" />
              <div>
                <p className="text-sm text-slate-500">Status</p>
                <Badge variant={
                  medicao.status === 'aprovada' ? 'default' :
                  medicao.status === 'pendente' ? 'secondary' : 'destructive'
                }>
                  {medicao.status === 'aprovada' ? 'Aprovada' :
                   medicao.status === 'pendente' ? 'Pendente' : 'Rejeitada'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Informações Financeiras Adicionais */}
          {(medicao.desconto || medicao.correcaoMonetaria || medicao.taxaMobilizacao) && (
            <>
              <Separator />
              <div className="space-y-3 bg-slate-50 p-3 rounded-lg">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Receipt className="w-4 h-4" />
                  Informações Financeiras
                </h4>

                {medicao.desconto && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">
                      Desconto {medicao.tipoDesconto === 'percentual' ? `(${medicao.desconto}%)` : '(Fixo)'}:
                    </span>
                    <span className="text-sm font-medium text-red-600">
                      - R$ {medicao.desconto.toFixed(2)}
                    </span>
                  </div>
                )}

                {medicao.correcaoMonetaria && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Correção Monetária (IGP-M):</span>
                    <span className="text-sm font-medium text-green-600">
                      + R$ {medicao.correcaoMonetaria.toFixed(2)}
                    </span>
                  </div>
                )}

                {medicao.taxaMobilizacao && (
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Taxa de Mobilização:</span>
                      <span className="text-sm font-medium">R$ {medicao.taxaMobilizacao.toFixed(2)}</span>
                    </div>
                    {medicao.observacaoMobilizacao && (
                      <div className="pl-4 pt-1 border-l-2 border-blue-200">
                        <p className="text-xs text-slate-600 italic flex items-start gap-1">
                          <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          {medicao.observacaoMobilizacao}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Despesas Vinculadas */}
          {medicao.despesas && medicao.despesas.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Receipt className="w-4 h-4" />
                  Despesas Vinculadas ({medicao.despesas.length})
                </h4>
                <div className="space-y-2">
                  {medicao.despesas.map((despesa: any, index: number) => (
                    <Card key={index} className="bg-slate-50">
                      <CardContent className="p-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{despesa.descricao}</p>
                            <div className="flex gap-2 mt-1 flex-wrap">
                              <Badge variant="outline" className="text-xs">
                                R$ {despesa.valor.toFixed(2)}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {despesa.tipo === 'fixa' ? 'Fixa' : despesa.tipo === 'recorrente' ? 'Recorrente' : 'Pontual'}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {despesa.vinculacao === 'obra' ? 'Obra Inteira' : `Data: ${despesa.data}`}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Observações */}
          {medicao.observacoes && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Observações Gerais</h4>
                <p className="text-sm text-slate-600 whitespace-pre-wrap">{medicao.observacoes}</p>
              </div>
            </>
          )}

          {medicao.status === 'pendente' && (onAprovar || onRejeitar) && (
            <>
              <Separator />
              <div className="flex justify-end gap-3">
                {onRejeitar && (
                  <Button 
                    variant="outline" 
                    onClick={() => onRejeitar(medicao)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Rejeitar
                  </Button>
                )}
                {onAprovar && (
                  <Button onClick={() => onAprovar(medicao)}>
                    <Check className="w-4 h-4 mr-2" />
                    Aprovar
                  </Button>
                )}
              </div>
            </>
          )}

          {medicao.status !== 'pendente' && (
            <>
              <Separator />
              <div className="flex justify-end">
                <Button variant="outline" onClick={onClose}>
                  Fechar
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MedicaoDetailModal;