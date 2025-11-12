import React, { useState, useEffect } from "react";
import localApi from "@/api/localClient";
import { api as base44 } from "@/api/apiAdapter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HelpCircle, Send, CheckCircle, Clock, MessageSquare } from "lucide-react";
import { useLanguage } from "../components/LanguageContext";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

export default function Support() {
  const { t, language } = useLanguage();
  const [user, setUser] = useState(null);
  const [messageType, setMessageType] = useState("question");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    localApi.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: myRequests = [] } = useQuery({
    queryKey: ['adminChats'],
    queryFn: async () => {
      if (!user) return [];
      // TODO: Implement admin chat functionality
      return [];
    },
    enabled: false, // Disabled until implemented
  });

  const submitRequestMutation = useMutation({
    mutationFn: async (data) => {
      // TODO: Implement admin chat functionality
      console.log('Admin chat not implemented yet:', data);
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['adminChats']);
      setMessage("");
      setMessageType("question");
      alert('Support request functionality not implemented yet');
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    
    try {
      // Use AI to generate a helpful response
      const aiResponse = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a helpful nutrition and diet assistant for the Fast Metabolism Diet program. 
        A user has sent the following ${messageType}: "${message}"
        
        Please provide a helpful, supportive, and informative response. If they're asking about:
        - Menu recommendations: Suggest phase-appropriate foods
        - Recipe help: Provide simple cooking tips
        - Portion questions: Give general guidance on serving sizes
        - General questions: Answer based on the Fast Metabolism Diet principles
        
        Keep the response concise (2-3 paragraphs max) and encouraging.
        ${language === 'ro' ? 'Respond in Romanian.' : 'Respond in English.'}`,
      });

      await submitRequestMutation.mutateAsync({
        user_email: user.email,
        message: message.trim(),
        message_type: messageType,
        admin_response: aiResponse,
        status: 'responded'
      });
    } catch (error) {
      console.error('Error submitting request:', error);
    }
    
    setIsSubmitting(false);
  };

  const messageTypes = [
    { value: 'question', label: t('question') },
    { value: 'help', label: t('helpRequest') },
    { value: 'advice', label: t('advice') },
    { value: 'menu_recommendation', label: t('menuRecommendation') },
    { value: 'recipe_help', label: t('recipeHelp') },
    { value: 'portion_question', label: t('portionQuestion') },
  ];

  const statusColors = {
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
    responded: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: CheckCircle },
    closed: { bg: 'bg-gray-100', text: 'text-gray-700', icon: CheckCircle },
  };

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('helpSupport')}</h1>
          <p className="text-gray-500 mt-1">{t('contactAdmin')}</p>
        </div>

        {/* Submit New Request */}
        <Card className="border-none shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-emerald-600" />
              {t('contactAdmin')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {t('selectTopicType')}
                </label>
                <Select value={messageType} onValueChange={setMessageType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {messageTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {t('describeIssue')}
                </label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={language === 'ro' 
                    ? "Descrie în detaliu întrebarea sau problema ta..." 
                    : "Describe your question or issue in detail..."}
                  rows={6}
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    {t('loading')}
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    {t('submitRequest')}
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* My Requests */}
        <Card className="border-none shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-purple-600" />
              {t('myRequests')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {myRequests.length > 0 ? (
              myRequests.map((request) => {
                const StatusIcon = statusColors[request.status].icon;
                const statusLabel = t(request.status);
                
                return (
                  <div key={request.id} className="p-4 bg-gray-50 rounded-xl space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={`${statusColors[request.status].bg} ${statusColors[request.status].text}`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusLabel}
                          </Badge>
                          <Badge variant="outline">
                            {messageTypes.find(t => t.value === request.message_type)?.label}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-500 mb-2">
                          {format(new Date(request.created_date), "d MMMM yyyy, HH:mm", { 
                            locale: language === 'ro' ? ro : undefined 
                          })}
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white p-3 rounded-lg">
                      <div className="text-sm font-medium text-gray-700 mb-1">
                        {language === 'ro' ? 'Mesajul tău:' : 'Your message:'}
                      </div>
                      <div className="text-sm text-gray-900">{request.message}</div>
                    </div>

                    {request.admin_response && (
                      <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                        <div className="text-sm font-medium text-emerald-700 mb-1 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          {t('adminResponse')}
                        </div>
                        <div className="text-sm text-gray-900 whitespace-pre-wrap">
                          {request.admin_response}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 text-gray-500">
                <HelpCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>{language === 'ro' ? 'Nu ai trimis încă cereri' : 'No requests sent yet'}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}