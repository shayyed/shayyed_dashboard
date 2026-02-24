import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { adminApi } from '../services/api';
import type { ChatThread, ChatMessage } from '../types';
import { UserRole } from '../types';
import { mockUsers, mockProjects, mockRequests, mockInvoices, mockQuickServiceOrders } from '../mock/data';
import { formatDate, formatDateTime } from '../utils/formatters';
import { FileText, Image as ImageIcon, ArrowRight } from 'lucide-react';

export const ChatDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [thread, setThread] = useState<ChatThread | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (id) {
      loadThread();
      loadMessages();
    }
  }, [id]);

  const loadThread = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getChatThread(id!);
      setThread(data);
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    try {
      const data = await adminApi.listChatMessages(id!);
      setMessages(data);
    } catch (error) {
      console.error('Load messages error:', error);
    }
  };

  // Auto-scroll to bottom when messages load
  useEffect(() => {
    if (messages.length > 0) {
      const chatContainer = document.querySelector('[data-chat-container]');
      if (chatContainer) {
        setTimeout(() => {
          chatContainer.scrollTop = chatContainer.scrollHeight;
        }, 100);
      }
    }
  }, [messages.length]);

  const handleExportChat = () => {
    // TODO: Implement export functionality
    console.log('Export chat:', { thread, messages });
  };

  // Helper function to get request ID from thread
  const getRequestIdFromThread = (thread: ChatThread): string | null => {
    if (thread.relatedType === 'request') {
      return thread.relatedId;
    } else if (thread.relatedType === 'project') {
      const project = mockProjects.find(p => p.id === thread.relatedId);
      return project ? project.requestId : null;
    } else if (thread.relatedType === 'invoice') {
      const invoice = mockInvoices.find(i => i.id === thread.relatedId);
      if (invoice) {
        const project = mockProjects.find(p => p.id === invoice.projectId);
        return project ? project.requestId : null;
      }
    }
    return null;
  };

  // Helper function to determine if request is regular or quick service
  const getRequestType = (requestId: string | null): 'regular' | 'quick' => {
    if (!requestId) return 'regular';
    const regularRequest = mockRequests.find(r => r.id === requestId);
    if (regularRequest) return 'regular';
    const quickOrder = mockQuickServiceOrders.find(q => q.id === requestId);
    if (quickOrder) return 'quick';
    return 'regular'; // Default
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">جاري التحميل...</div>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <EmptyState title="المحادثة غير موجودة" />
      </div>
    );
  }

  const client = mockUsers.find(u => u.id === thread.clientId);
  const contractor = mockUsers.find(u => u.id === thread.contractorId);

  const getRelatedEntityLink = () => {
    if (thread.relatedType === 'project') {
      const project = mockProjects.find(p => p.id === thread.relatedId);
      if (project) {
        const request = mockRequests.find(r => r.id === project.requestId);
        if (request) return `/requests/regular/${request.id}`;
      }
      return `/projects/${thread.relatedId}`;
    } else if (thread.relatedType === 'request') {
      return `/requests/regular/${thread.relatedId}`;
    } else if (thread.relatedType === 'invoice') {
      return `/invoices/${thread.relatedId}`;
    }
    return '#';
  };

  const getRelatedEntityTitle = () => {
    if (thread.relatedType === 'project') {
      const project = mockProjects.find(p => p.id === thread.relatedId);
      if (project) {
        const request = mockRequests.find(r => r.id === project.requestId);
        if (request) return request.title;
      }
      return project ? project.title : thread.relatedId;
    } else if (thread.relatedType === 'request') {
      const request = mockRequests.find(r => r.id === thread.relatedId);
      return request ? request.title : thread.relatedId;
    } else if (thread.relatedType === 'invoice') {
      const invoice = mockInvoices.find(i => i.id === thread.relatedId);
      return invoice ? invoice.title : thread.relatedId;
    }
    return thread.relatedId;
  };

  // Sort messages by date (oldest first)
  const sortedMessages = [...messages].sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return (
    <div className="space-y-6">
      <div>
        <Button variant="secondary" onClick={() => navigate('/chats')} className="mb-2">
          <ArrowRight className="w-4 h-4 ml-2" />
          العودة إلى المحادثات
        </Button>
        <h1 className="text-2xl font-semibold text-[#111111]">المحادثة</h1>
        <p className="text-sm text-gray-600 mt-1">معرف المحادثة: {thread.id}</p>
      </div>

      {/* Thread Info */}
      <Card title="معلومات المحادثة">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">معرف المحادثة</p>
            <p className="text-[#111111] font-medium">{thread.id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">نوع الطلب</p>
            {(() => {
              const requestId = getRequestIdFromThread(thread);
              const type = getRequestType(requestId);
              return (
                <span className={`text-xs px-2 py-1 rounded ${
                  type === 'regular' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                }`}>
                  {type === 'regular' ? 'عادي' : 'خدمة سريعة'}
                </span>
              );
            })()}
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">عنوان الطلب</p>
            <Link to={getRelatedEntityLink()} className="text-blue-600 hover:underline">
              {getRelatedEntityTitle()}
            </Link>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">تاريخ آخر تحديث</p>
            <p className="text-[#111111] font-medium">{formatDateTime(thread.updatedAt)}</p>
          </div>
        </div>
      </Card>

      {/* Related Entities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {client && (
          <Card title="معلومات العميل">
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-600">الاسم</p>
                <Link to={`/users/clients/${client.id}`} className="text-blue-600 hover:underline">
                  {client.name}
                </Link>
              </div>
              <div>
                <p className="text-sm text-gray-600">معرف العميل</p>
                <p className="text-[#111111]">{client.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">رقم الجوال</p>
                <p className="text-[#111111]">{client.phone}</p>
              </div>
            </div>
          </Card>
        )}

        {contractor && (
          <Card title="معلومات المقاول">
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-600">الاسم</p>
                <Link
                  to={`/users/contractors/${contractor.id}`}
                  className="text-blue-600 hover:underline"
                >
                  {contractor.name}
                </Link>
              </div>
              <div>
                <p className="text-sm text-gray-600">معرف المقاول</p>
                <p className="text-[#111111]">{contractor.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">رقم الجوال</p>
                <p className="text-[#111111]">{contractor.phone}</p>
              </div>
              {'companyName' in contractor && contractor.companyName && (
                <div>
                  <p className="text-sm text-gray-600">اسم الشركة</p>
                  <p className="text-[#111111]">{contractor.companyName}</p>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>

      {/* Messages Section */}
      <Card>
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-[#111111]">الرسائل</h2>
          <Button variant="primary" onClick={handleExportChat}>
            تصدير المحادثة
          </Button>
        </div>
        
        <div className="space-y-4">
          {/* Color Legend */}
          <div className="flex items-center gap-4 pb-3 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-500/20 border-2 border-blue-500"></div>
              <span className="text-sm text-gray-600">العميل</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-purple-500/20 border-2 border-purple-500"></div>
              <span className="text-sm text-gray-600">المقاول</span>
            </div>
          </div>

          {/* Messages List */}
          {sortedMessages.length === 0 ? (
            <EmptyState title="لا توجد رسائل" />
          ) : (
            <div className="space-y-4 h-[600px] overflow-y-auto px-3 py-2 scroll-smooth" data-chat-container>
              {sortedMessages.map((message, index) => {
                const sender = mockUsers.find(u => u.id === message.senderId);
                const isClient = message.senderRole === UserRole.CLIENT;
                const prevMessage = index > 0 ? sortedMessages[index - 1] : null;
                const showSenderInfo = !prevMessage || prevMessage.senderId !== message.senderId;
                const isSameDay = prevMessage && 
                  new Date(message.createdAt).toDateString() === new Date(prevMessage.createdAt).toDateString();

                return (
                  <div key={message.id} className="flex flex-col">
                    {/* Date separator */}
                    {!isSameDay && index > 0 && (
                      <div className="flex items-center justify-center my-4">
                        <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                          {formatDate(message.createdAt)}
                        </div>
                      </div>
                    )}
                    
                    {/* Message bubble */}
                    <div className={`flex ${isClient ? 'justify-start' : 'justify-end'} mb-1`}>
                      <div className={`${message.attachments && message.attachments.length > 0 ? 'max-w-[85%] min-w-[320px]' : 'max-w-[70%] min-w-[180px]'} ${isClient ? 'items-start' : 'items-end'} flex flex-col`}>
                        {/* Sender name */}
                        {showSenderInfo && (
                          <div className={`text-xs text-gray-500 mb-2 px-3 ${isClient ? 'text-left' : 'text-right'}`}>
                            {sender ? sender.name : message.senderId} • {isClient ? 'عميل' : 'مقاول'}
                          </div>
                        )}
                        
                        {/* Message content */}
                        <div
                          className={`px-5 py-3.5 rounded-3xl shadow-sm ${
                            isClient
                              ? 'bg-blue-500/15 text-blue-900 border border-blue-200/30'
                              : 'bg-purple-500/15 text-purple-900 border border-purple-200/30'
                          }`}
                        >
                          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words mb-3">
                            {message.content}
                          </p>
                          
                          {/* Attachments */}
                          {message.attachments && message.attachments.length > 0 && (
                            <div className="mt-3 space-y-2.5">
                              {message.attachments.map((attachment, attIndex) => {
                                const fileName = attachment.split('/').pop() || `مرفق ${attIndex + 1}`;
                                const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);
                                const isPdf = /\.pdf$/i.test(fileName);
                                
                                return (
                                  <a
                                    key={attIndex}
                                    href={attachment}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`flex items-center gap-3 w-full px-4 py-3 rounded-2xl transition-all hover:scale-[1.01] shadow-md ${
                                      isClient
                                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                                        : 'bg-purple-500 text-white hover:bg-purple-600'
                                    }`}
                                  >
                                    {isPdf ? (
                                      <FileText className="w-5 h-5 flex-shrink-0" />
                                    ) : isImage ? (
                                      <ImageIcon className="w-5 h-5 flex-shrink-0" />
                                    ) : null}
                                    <span className="text-sm font-medium flex-1">{fileName}</span>
                                  </a>
                                );
                              })}
                            </div>
                          )}
                        </div>
                        
                        {/* Timestamp */}
                        <div className={`text-xs text-gray-400 mt-2 px-3 ${isClient ? 'text-left' : 'text-right'}`}>
                          {formatDateTime(message.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>

    </div>
  );
};
