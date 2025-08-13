import { useState, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Settings, GripVertical, Eye, EyeOff, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

export interface DashboardWidget {
  id: string;
  title: string;
  component: React.ComponentType<any>;
  isVisible: boolean;
  size: 'small' | 'medium' | 'large' | 'full';
  order: number;
  category: 'metrics' | 'charts' | 'tables' | 'tools';
}

interface DashboardCustomizerProps {
  widgets: DashboardWidget[];
  onWidgetsChange: (widgets: DashboardWidget[]) => void;
  layouts?: {
    compact: string;
    comfortable: string;
    spacious: string;
  };
  currentLayout?: string;
  onLayoutChange?: (layout: string) => void;
}

export function DashboardCustomizer({
  widgets,
  onWidgetsChange,
  layouts = {
    compact: 'Compact',
    comfortable: 'Comfortable', 
    spacious: 'Spacious'
  },
  currentLayout = 'comfortable',
  onLayoutChange
}: DashboardCustomizerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localWidgets, setLocalWidgets] = useState(widgets);

  const handleDragEnd = useCallback((result: any) => {
    if (!result.destination) return;

    const newWidgets = Array.from(localWidgets);
    const [reorderedWidget] = newWidgets.splice(result.source.index, 1);
    newWidgets.splice(result.destination.index, 0, reorderedWidget);

    // Update order property
    const updatedWidgets = newWidgets.map((widget, index) => ({
      ...widget,
      order: index
    }));

    setLocalWidgets(updatedWidgets);
    onWidgetsChange(updatedWidgets);
  }, [localWidgets, onWidgetsChange]);

  const toggleWidgetVisibility = useCallback((widgetId: string) => {
    const updatedWidgets = localWidgets.map(widget =>
      widget.id === widgetId
        ? { ...widget, isVisible: !widget.isVisible }
        : widget
    );
    setLocalWidgets(updatedWidgets);
    onWidgetsChange(updatedWidgets);
  }, [localWidgets, onWidgetsChange]);

  const changeWidgetSize = useCallback((widgetId: string, size: DashboardWidget['size']) => {
    const updatedWidgets = localWidgets.map(widget =>
      widget.id === widgetId
        ? { ...widget, size }
        : widget
    );
    setLocalWidgets(updatedWidgets);
    onWidgetsChange(updatedWidgets);
  }, [localWidgets, onWidgetsChange]);

  const resetToDefaults = useCallback(() => {
    const defaultWidgets = localWidgets.map((widget, index) => ({
      ...widget,
      isVisible: true,
      size: 'medium' as const,
      order: index
    }));
    setLocalWidgets(defaultWidgets);
    onWidgetsChange(defaultWidgets);
  }, [localWidgets, onWidgetsChange]);

  const visibleWidgets = localWidgets.filter(widget => widget.isVisible);
  const hiddenWidgets = localWidgets.filter(widget => !widget.isVisible);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Customize
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customize Dashboard</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Layout Selection */}
          {onLayoutChange && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Layout Style</Label>
              <Select value={currentLayout} onValueChange={onLayoutChange}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(layouts).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Widget Configuration */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Dashboard Widgets</Label>
              <Button variant="outline" size="sm" onClick={resetToDefaults}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset to Defaults
              </Button>
            </div>

            {/* Visible Widgets */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground">Visible Widgets</h4>
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="visible-widgets">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                      {visibleWidgets
                        .sort((a, b) => a.order - b.order)
                        .map((widget, index) => (
                          <Draggable key={widget.id} draggableId={widget.id} index={index}>
                            {(provided, snapshot) => (
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={cn(
                                  "transition-shadow",
                                  snapshot.isDragging && "shadow-lg"
                                )}
                              >
                                <CardContent className="p-4">
                                  <div className="flex items-center gap-3">
                                    <div
                                      {...provided.dragHandleProps}
                                      className="cursor-grab active:cursor-grabbing"
                                    >
                                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    
                                    <div className="flex-1">
                                      <div className="flex items-center justify-between">
                                        <span className="font-medium text-sm">{widget.title}</span>
                                        <div className="flex items-center gap-2">
                                          <Select
                                            value={widget.size}
                                            onValueChange={(size) => changeWidgetSize(widget.id, size as DashboardWidget['size'])}
                                          >
                                            <SelectTrigger className="w-24 h-7 text-xs">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="small">Small</SelectItem>
                                              <SelectItem value="medium">Medium</SelectItem>
                                              <SelectItem value="large">Large</SelectItem>
                                              <SelectItem value="full">Full</SelectItem>
                                            </SelectContent>
                                          </Select>
                                          
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => toggleWidgetVisibility(widget.id)}
                                            className="h-7 w-7 p-0"
                                          >
                                            <EyeOff className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      </div>
                                      <div className="text-xs text-muted-foreground mt-1 capitalize">
                                        {widget.category} • {widget.size}
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                          </Draggable>
                        ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>

            {/* Hidden Widgets */}
            {hiddenWidgets.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">Hidden Widgets</h4>
                <div className="space-y-2">
                  {hiddenWidgets.map((widget) => (
                    <Card key={widget.id} className="opacity-60">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium text-sm">{widget.title}</span>
                            <div className="text-xs text-muted-foreground capitalize">
                              {widget.category}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleWidgetVisibility(widget.id)}
                            className="h-7 w-7 p-0"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Hook for managing dashboard customization
export function useDashboardCustomization(
  initialWidgets: DashboardWidget[],
  storageKey = 'dashboard-layout'
) {
  const [widgets, setWidgets] = useState<DashboardWidget[]>(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const savedWidgets = JSON.parse(saved);
        // Merge with initial widgets to handle new widgets
        return initialWidgets.map(widget => {
          const savedWidget = savedWidgets.find((w: DashboardWidget) => w.id === widget.id);
          return savedWidget ? { ...widget, ...savedWidget } : widget;
        });
      } catch {
        return initialWidgets;
      }
    }
    return initialWidgets;
  });

  const [layout, setLayout] = useState(() => {
    return localStorage.getItem(`${storageKey}-style`) || 'comfortable';
  });

  const updateWidgets = useCallback((newWidgets: DashboardWidget[]) => {
    setWidgets(newWidgets);
    localStorage.setItem(storageKey, JSON.stringify(newWidgets));
  }, [storageKey]);

  const updateLayout = useCallback((newLayout: string) => {
    setLayout(newLayout);
    localStorage.setItem(`${storageKey}-style`, newLayout);
  }, [storageKey]);

  const resetCustomization = useCallback(() => {
    setWidgets(initialWidgets);
    setLayout('comfortable');
    localStorage.removeItem(storageKey);
    localStorage.removeItem(`${storageKey}-style`);
  }, [initialWidgets, storageKey]);

  return {
    widgets,
    layout,
    updateWidgets,
    updateLayout,
    resetCustomization
  };
}