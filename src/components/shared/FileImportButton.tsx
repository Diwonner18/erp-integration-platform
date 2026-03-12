import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import FileImportModal from './FileImportModal';
import type { TargetType } from '@/lib/fileParser';

interface FileImportButtonProps {
  targetType?: TargetType;
  className?: string;
}

const FileImportButton: React.FC<FileImportButtonProps> = ({ targetType, className }) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setShowModal(true)} className={className}>
        <Upload className="w-4 h-4 mr-2" />
        Importar
      </Button>
      <FileImportModal
        open={showModal}
        onOpenChange={setShowModal}
        defaultTargetType={targetType}
      />
    </>
  );
};

export default FileImportButton;
