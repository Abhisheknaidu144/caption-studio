import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { 
  Captions, 
  Upload, 
  Download, 
  Save,
  Home,
  Loader2,
  Undo,
  Redo,
  RotateCw
} from 'lucide-react';
// UserAccountButton moved to Sidebar

export default function DashboardHeader({ 
  onUploadClick, 
  onExportClick,
  onSaveClick,
  isSaving,
  hasVideo,
  hasCaptions,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onRefresh
}) {
  return (
    <header className="h-16 bg-zinc-950 border-b border-white/5 flex items-center justify-between px-4 lg:px-6">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <Link to={createPageUrl('Home')} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
            <Captions className="w-4 h-4 text-white" />
          </div>
          <span className="hidden sm:block text-white font-semibold">Caption Studio</span>
        </Link>
      </div>
      
      {/* Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {hasVideo && (
          <div className="flex items-center gap-1 mr-2 border-r border-white/10 pr-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onUndo}
              disabled={!canUndo}
              className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
              title="Undo"
            >
              <Undo className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={onRedo}
              disabled={!canRedo}
              className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
              title="Redo"
            >
              <Redo className="w-4 h-4" />
            </Button>
            
            {onRefresh && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onRefresh}
                className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                title="Refresh"
              >
                <RotateCw className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={onUploadClick}
          className="text-gray-400 hover:text-white hidden sm:flex"
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload New
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onUploadClick}
          className="text-gray-400 hover:text-white sm:hidden"
        >
          <Upload className="w-4 h-4" />
        </Button>
        
        {hasCaptions && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={onSaveClick}
              disabled={isSaving}
              className="text-gray-400 hover:text-white"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 sm:mr-2" />
              )}
              <span className="hidden sm:inline">Save</span>
            </Button>
            
            <Button
              onClick={onExportClick}
              size="sm"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            >
              <Download className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </>
        )}

      </div>
    </header>
  );
}