
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Upload, Save, Send, AlertCircle, CheckCircle, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Class } from '@/types';

interface AbsenceFormProps {
  userId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const AbsenceForm = ({ userId, onClose, onSuccess }: AbsenceFormProps) => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [formData, setFormData] = useState({
    classId: '',
    reason: '',
    urgency: 'low' as 'low' | 'medium' | 'high',
    supportingDocs: [] as File[]
  });
  const [wordCount, setWordCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEnrolledClasses();
  }, [userId]);

  useEffect(() => {
    setWordCount(formData.reason.trim().split(/\s+/).filter(word => word.length > 0).length);
  }, [formData.reason]);

  const fetchEnrolledClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('student_classes')
        .select(`
          classes:class_id (
            id,
            name,
            code,
            department
          )
        `)
        .eq('student_id', userId);

      if (error) {
        console.error('Error fetching classes:', error);
        return;
      }

      const enrolledClasses = data?.map(item => item.classes).filter(Boolean) || [];
      setClasses(enrolledClasses as Class[]);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const handleReasonChange = (value: string) => {
    setFormData({ ...formData, reason: value });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData({ ...formData, supportingDocs: [...formData.supportingDocs, ...files] });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (wordCount < 300) {
      toast.error('Explanation must be at least 300 words');
      return;
    }

    if (!formData.classId) {
      toast.error('Please select a class');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('absence_requests')
        .insert({
          student_id: userId,
          class_id: formData.classId,
          reason: formData.reason,
          urgency: formData.urgency
        });

      if (error) {
        console.error('Error submitting absence request:', error);
        toast.error('Error submitting request');
        return;
      }

      toast.success('Absence explanation submitted successfully');
      onSuccess();
    } catch (error) {
      console.error('Error submitting absence request:', error);
      toast.error('Error submitting request');
    } finally {
      setLoading(false);
    }
  };


  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Submit Absence Explanation</DialogTitle>
          <DialogDescription>
            Provide a detailed explanation for your absence. Minimum 300 words required.
          </DialogDescription>
        </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="class">Class</Label>
              <Select value={formData.classId} onValueChange={(value) => setFormData({ ...formData, classId: value })}>
                <SelectTrigger id="class">
                  <SelectValue placeholder="Select the class you missed" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name} ({cls.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="urgency">Priority Level</Label>
                <Badge className={getUrgencyColor(formData.urgency)}>
                  {formData.urgency}
                </Badge>
              </div>
              <Select value={formData.urgency} onValueChange={(value: any) => setFormData({ ...formData, urgency: value })}>
                <SelectTrigger id="urgency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low - Personal/Non-urgent</SelectItem>
                  <SelectItem value="medium">Medium - Important commitment</SelectItem>
                  <SelectItem value="high">High - Emergency/Medical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="reason">Detailed Explanation</Label>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm ${wordCount >= 300 ? 'text-green-600' : 'text-red-600'}`}>
                    {wordCount} words
                  </span>
                  {wordCount >= 300 ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  )}
                </div>
              </div>
              <Textarea
                id="reason"
                placeholder="Provide a comprehensive explanation of your absence. Include relevant details such as dates, circumstances, and any supporting information. Minimum 300 words required."
                value={formData.reason}
                onChange={(e) => handleReasonChange(e.target.value)}
                rows={10}
                className="resize-none"
              />
              {wordCount < 300 && (
                <p className="text-sm text-red-600">
                  {300 - wordCount} more words needed to meet minimum requirement
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="documents">Supporting Documents (Optional)</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600 mb-2">
                  Upload medical certificates, official letters, or other supporting documents
                </p>
                <Input
                  id="documents"
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={handleFileUpload}
                  className="max-w-xs mx-auto"
                />
              </div>
              {formData.supportingDocs.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Uploaded Files:</p>
                  {formData.supportingDocs.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const filtered = formData.supportingDocs.filter((_, i) => i !== index);
                          setFormData({ ...formData, supportingDocs: filtered });
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading || wordCount < 300 || !formData.classId}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Explanation'
            )}
          </Button>
        </DialogFooter>
          </form>
      </DialogContent>
    </Dialog>
  );
};

export default AbsenceForm;
