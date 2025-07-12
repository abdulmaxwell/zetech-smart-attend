
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { FileText, Upload, Save, Send, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const AbsenceForm = () => {
  const [formData, setFormData] = useState({
    classId: '',
    reason: '',
    urgency: 'low' as 'low' | 'medium' | 'high',
    supportingDocs: [] as File[]
  });
  const [isDraft, setIsDraft] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleReasonChange = (value: string) => {
    setFormData({ ...formData, reason: value });
    setWordCount(value.trim().split(/\s+/).length);
    
    // Auto-save draft every 30 seconds
    setIsDraft(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData({ ...formData, supportingDocs: [...formData.supportingDocs, ...files] });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (wordCount < 300) {
      toast.error('Explanation must be at least 300 words');
      setLoading(false);
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Absence explanation submitted successfully!');
      setFormData({ classId: '', reason: '', urgency: 'low', supportingDocs: [] });
      setWordCount(0);
    } catch (error) {
      toast.error('Failed to submit explanation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const saveDraft = () => {
    setIsDraft(false);
    toast.success('Draft saved');
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
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="w-6 h-6 mr-2" />
            Submit Absence Explanation
          </CardTitle>
          <CardDescription>
            Provide a detailed explanation for your absence. Minimum 300 words required.
          </CardDescription>
          {isDraft && (
            <Alert>
              <Save className="h-4 w-4" />
              <AlertDescription>
                You have unsaved changes. 
                <Button variant="link" className="p-0 ml-1 h-auto" onClick={saveDraft}>
                  Save draft
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="class">Class</Label>
              <Select value={formData.classId} onValueChange={(value) => setFormData({ ...formData, classId: value })}>
                <SelectTrigger id="class">
                  <SelectValue placeholder="Select the class you missed" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cs101">Advanced Programming</SelectItem>
                  <SelectItem value="cs102">Database Systems</SelectItem>
                  <SelectItem value="cs103">Software Engineering</SelectItem>
                  <SelectItem value="cs104">Data Structures</SelectItem>
                  <SelectItem value="cs105">Web Development</SelectItem>
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

            <div className="flex justify-between pt-4">
              <Button type="button" variant="outline" onClick={saveDraft}>
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </Button>
              
              <Button 
                type="submit" 
                disabled={loading || wordCount < 300 || !formData.classId}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Explanation
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AbsenceForm;
