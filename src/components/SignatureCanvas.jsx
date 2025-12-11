import { useRef, useState, useEffect } from 'react';
import ReactSignatureCanvas from 'react-signature-canvas';
import { X, Check } from 'lucide-react';

const SignaturePad = ({ onSave, initialSignature, signedAt, disabled = false }) => {
  const sigCanvas = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(!!initialSignature);

  useEffect(() => {
    if (initialSignature && sigCanvas.current) {
      // Load existing signature
      const img = new Image();
      img.src = initialSignature;
      img.onload = () => {
        const canvas = sigCanvas.current.getCanvas();
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setHasSignature(true);
      };
    }
  }, [initialSignature]);

  const handleBegin = () => {
    setIsDrawing(true);
  };

  const handleEnd = () => {
    setIsDrawing(false);
    if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      setHasSignature(true);
    }
  };

  const handleClear = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear();
      setHasSignature(false);
    }
  };

  const handleSave = () => {
    if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      // Save the full canvas without trimming to preserve the entire signature
      const signatureData = sigCanvas.current.toDataURL('image/png');
      onSave(signatureData);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Digital Signature
        </label>
        <p className="text-xs text-gray-500 mb-2">
          Please sign below to confirm this invoice
        </p>
      </div>
      
      {disabled && initialSignature ? (
        // Display saved signature as image to preserve full signature
        <div className="border-2 border-gray-300 rounded-lg bg-white p-4">
          <div className="flex items-center justify-center min-h-[192px] bg-gray-50 rounded overflow-visible">
            <img 
              src={initialSignature} 
              alt="Saved Signature" 
              className="w-full h-auto max-h-[300px] object-contain"
              style={{ 
                imageRendering: 'auto',
                maxWidth: '100%',
                height: 'auto'
              }}
            />
          </div>
          <div className="mt-3 text-center">
            <p className="text-sm text-gray-600 font-medium">Signature Saved</p>
          </div>
        </div>
      ) : (
        // Editable signature canvas
        <div className="border-2 border-gray-300 rounded-lg bg-white relative" style={{ overflow: 'visible' }}>
          <ReactSignatureCanvas
            ref={sigCanvas}
            canvasProps={{
              className: 'w-full',
              style: { 
                touchAction: 'none',
                height: '192px',
                display: 'block'
              }
            }}
            backgroundColor="rgb(255, 255, 255)"
            penColor="rgb(0, 0, 0)"
            onBegin={handleBegin}
            onEnd={handleEnd}
            disabled={disabled}
          />
        </div>
      )}

      {!disabled && (
        <div className="flex gap-2 mt-3">
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!hasSignature}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check className="w-4 h-4" />
            Save Signature
          </button>
        </div>
      )}

      {disabled && initialSignature && signedAt && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            ✓ Invoice signed on {new Date(signedAt).toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  );
};

export default SignaturePad;

