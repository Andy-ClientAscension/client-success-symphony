import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X, Check, Edit, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { STORAGE_KEYS, saveData, loadData } from "@/utils/persistence";
import { 
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type FieldType = 'text' | 'number' | 'date' | 'dropdown' | 'checkbox';

interface CustomField {
  id: string;
  name: string;
  type: FieldType;
  options?: string[];  // For dropdown fields
  required: boolean;
}

interface CustomFieldValue {
  fieldId: string;
  value: string | boolean | number | null;
}

interface CustomFieldsProps {
  clientId: string;
  onSave?: (fields: CustomFieldValue[]) => void;
}

export function CustomFields({ clientId, onSave }: CustomFieldsProps) {
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [fieldValues, setFieldValues] = useState<CustomFieldValue[]>([]);
  const [isAddingField, setIsAddingField] = useState(false);
  const [newField, setNewField] = useState<Partial<CustomField>>({
    name: '',
    type: 'text',
    options: [],
    required: false
  });
  const [editingField, setEditingField] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fieldToDelete, setFieldToDelete] = useState<string | null>(null);
  const [newOption, setNewOption] = useState('');
  
  const { toast } = useToast();

  // Load custom fields from storage
  useEffect(() => {
    const defaultFields: CustomField[] = [
      {
        id: '1',
        name: 'Account Manager',
        type: 'text',
        required: false
      },
      {
        id: '2',
        name: 'Contract Value',
        type: 'number',
        required: true
      },
      {
        id: '3',
        name: 'Industry',
        type: 'dropdown',
        options: ['Technology', 'Healthcare', 'Finance', 'Education', 'Retail'],
        required: false
      }
    ];
    
    const fields = loadData(`${STORAGE_KEYS.CUSTOM_FIELDS}`, defaultFields);
    setCustomFields(fields);
    
    // Load field values for this client
    const values = loadData(`${STORAGE_KEYS.CLIENT_CUSTOM_FIELDS}_${clientId}`, []);
    setFieldValues(values);
  }, [clientId]);
  
  // Save custom fields and values when they change
  useEffect(() => {
    saveData(`${STORAGE_KEYS.CUSTOM_FIELDS}`, customFields);
  }, [customFields]);
  
  useEffect(() => {
    saveData(`${STORAGE_KEYS.CLIENT_CUSTOM_FIELDS}_${clientId}`, fieldValues);
    if (onSave) {
      onSave(fieldValues);
    }
  }, [fieldValues, clientId, onSave]);
  
  const handleAddField = () => {
    if (!newField.name?.trim()) {
      toast({
        title: "Field name required",
        description: "Please provide a name for the custom field",
        variant: "destructive",
      });
      return;
    }
    
    // Check if field with same name already exists
    if (customFields.some(field => field.name.toLowerCase() === newField.name?.toLowerCase())) {
      toast({
        title: "Field already exists",
        description: "A field with this name already exists",
        variant: "destructive",
      });
      return;
    }
    
    const field: CustomField = {
      id: Date.now().toString(),
      name: newField.name,
      type: newField.type as FieldType || 'text',
      options: newField.type === 'dropdown' ? newField.options : undefined,
      required: newField.required || false
    };
    
    setCustomFields([...customFields, field]);
    setIsAddingField(false);
    setNewField({
      name: '',
      type: 'text',
      options: [],
      required: false
    });
    
    toast({
      title: "Field Added",
      description: `${field.name} has been added as a custom field`,
    });
  };
  
  const handleSaveEdit = () => {
    if (!editingField || !newField.name?.trim()) return;
    
    setCustomFields(customFields.map(field => 
      field.id === editingField
        ? {
            ...field,
            name: newField.name || field.name,
            type: newField.type as FieldType || field.type,
            options: newField.type === 'dropdown' ? newField.options : undefined,
            required: newField.required !== undefined ? newField.required : field.required
          }
        : field
    ));
    
    setEditingField(null);
    setNewField({
      name: '',
      type: 'text',
      options: [],
      required: false
    });
    
    toast({
      title: "Field Updated",
      description: "Custom field has been updated successfully",
    });
  };
  
  const startEdit = (field: CustomField) => {
    setEditingField(field.id);
    setNewField({
      name: field.name,
      type: field.type,
      options: field.options || [],
      required: field.required
    });
  };
  
  const confirmDelete = () => {
    if (!fieldToDelete) return;
    
    setCustomFields(customFields.filter(field => field.id !== fieldToDelete));
    setFieldValues(fieldValues.filter(value => value.fieldId !== fieldToDelete));
    
    setFieldToDelete(null);
    setDeleteDialogOpen(false);
    
    toast({
      title: "Field Deleted",
      description: "Custom field has been deleted successfully",
    });
  };
  
  const handleAddOption = () => {
    if (!newOption.trim()) return;
    
    if (newField.options?.includes(newOption)) {
      toast({
        title: "Option already exists",
        description: "This option is already in the list",
        variant: "destructive",
      });
      return;
    }
    
    setNewField({
      ...newField,
      options: [...(newField.options || []), newOption]
    });
    
    setNewOption('');
  };
  
  const handleRemoveOption = (option: string) => {
    setNewField({
      ...newField,
      options: newField.options?.filter(o => o !== option) || []
    });
  };
  
  const handleFieldValueChange = (fieldId: string, value: string | boolean | number | null) => {
    // Check if we already have a value for this field
    const existingIndex = fieldValues.findIndex(v => v.fieldId === fieldId);
    
    if (existingIndex >= 0) {
      // Update existing value
      const updatedValues = [...fieldValues];
      updatedValues[existingIndex] = { ...updatedValues[existingIndex], value };
      setFieldValues(updatedValues);
    } else {
      // Add new value
      setFieldValues([...fieldValues, { fieldId, value }]);
    }
  };
  
  const getFieldValue = (fieldId: string) => {
    const fieldValue = fieldValues.find(v => v.fieldId === fieldId);
    return fieldValue ? fieldValue.value : null;
  };
  
  const renderFieldEditor = () => {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="field-name">Field Name</Label>
          <Input
            id="field-name"
            value={newField.name || ''}
            onChange={(e) => setNewField({ ...newField, name: e.target.value })}
            placeholder="e.g., Account Manager"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="field-type">Field Type</Label>
          <Select
            value={newField.type || 'text'}
            onValueChange={(value: FieldType) => setNewField({ 
              ...newField, 
              type: value,
              // Reset options if changing from dropdown to another type
              options: value === 'dropdown' ? newField.options : []
            })}
          >
            <SelectTrigger id="field-type">
              <SelectValue placeholder="Select field type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="number">Number</SelectItem>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="dropdown">Dropdown</SelectItem>
              <SelectItem value="checkbox">Checkbox</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {newField.type === 'dropdown' && (
          <div className="space-y-2 border p-3 rounded-md">
            <Label>Dropdown Options</Label>
            
            <div className="flex space-x-2 mb-2">
              <Input
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                placeholder="Add option"
              />
              <Button 
                type="button" 
                size="icon" 
                onClick={handleAddOption}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-2">
              {newField.options?.map((option, index) => (
                <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                  <span>{option}</span>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6" 
                    onClick={() => handleRemoveOption(option)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              
              {!newField.options?.length && (
                <div className="text-sm text-muted-foreground">
                  No options added yet
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="flex items-center space-x-2">
          <input 
            type="checkbox" 
            id="field-required"
            checked={newField.required || false}
            onChange={(e) => setNewField({ ...newField, required: e.target.checked })}
            className="form-checkbox h-4 w-4 text-primary"
          />
          <Label htmlFor="field-required">Required Field</Label>
        </div>
      </div>
    );
  };
  
  const renderFieldInput = (field: CustomField) => {
    const value = getFieldValue(field.id);
    
    switch (field.type) {
      case 'text':
        return (
          <Input
            value={(value as string) || ''}
            onChange={(e) => handleFieldValueChange(field.id, e.target.value)}
            placeholder={field.required ? "Required" : "Optional"}
          />
        );
        
      case 'number':
        return (
          <Input
            type="number"
            value={(value as number)?.toString() || ''}
            onChange={(e) => handleFieldValueChange(field.id, e.target.value ? Number(e.target.value) : null)}
            placeholder={field.required ? "Required" : "Optional"}
          />
        );
        
      case 'date':
        return (
          <Input
            type="date"
            value={(value as string) || ''}
            onChange={(e) => handleFieldValueChange(field.id, e.target.value)}
          />
        );
        
      case 'dropdown':
        return (
          <Select 
            value={(value as string) || ''} 
            onValueChange={(val) => handleFieldValueChange(field.id, val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option, index) => (
                <SelectItem key={index} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
        
      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <input 
              type="checkbox" 
              id={`field-${field.id}`}
              checked={value as boolean || false}
              onChange={(e) => handleFieldValueChange(field.id, e.target.checked)}
              className="form-checkbox h-4 w-4 text-primary"
            />
            <Label htmlFor={`field-${field.id}`}>Yes</Label>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Custom Fields</CardTitle>
        <Dialog open={isAddingField} onOpenChange={setIsAddingField}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" /> Add Field
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Custom Field</DialogTitle>
            </DialogHeader>
            
            {renderFieldEditor()}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddingField(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddField}>
                Add Field
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {customFields.length > 0 ? (
          customFields.map(field => (
            <div key={field.id} className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="flex items-center">
                  {field.name}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                <div className="flex space-x-1">
                  <Dialog open={editingField === field.id} onOpenChange={(open) => !open && setEditingField(null)}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7" 
                        onClick={() => startEdit(field)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Custom Field</DialogTitle>
                      </DialogHeader>
                      
                      {renderFieldEditor()}
                      
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingField(null)}>
                          Cancel
                        </Button>
                        <Button onClick={handleSaveEdit}>
                          Save Changes
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 text-destructive"
                    onClick={() => {
                      setFieldToDelete(field.id);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {renderFieldInput(field)}
            </div>
          ))
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            No custom fields defined yet
          </div>
        )}
      </CardContent>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Custom Field</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this custom field and all its values across all clients. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setFieldToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
