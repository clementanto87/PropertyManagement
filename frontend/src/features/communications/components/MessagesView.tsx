import { useState, useEffect, useRef } from 'react';
import { Send, User, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { api } from '@/lib/api';

type Message = {
    id: string;
    content: string;
    direction: 'INBOUND' | 'OUTBOUND';
    createdAt: string;
    isRead: boolean;
    user?: {
        name: string;
    };
    tenant?: {
        name: string;
    };
};

export function MessagesView({ tenantId }: { tenantId: string }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const fetchMessages = async () => {
        try {
            const response = await api.get<Message[]>(`/communications/messages/list?tenantId=${tenantId}`);
            setMessages(response);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching messages:', error);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
        // Poll for new messages every 10 seconds
        const interval = setInterval(fetchMessages, 10000);
        return () => clearInterval(interval);
    }, [tenantId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            setIsSending(true);
            await api.post('/communications/messages', {
                content: newMessage,
                tenantId,
            });
            setNewMessage('');
            fetchMessages(); // Refresh immediately
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setIsSending(false);
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center text-gray-500">Loading messages...</div>;
    }

    return (
        <div className="flex flex-col h-[600px] bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
                {messages.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Send className="h-8 w-8 text-blue-400" />
                        </div>
                        <h3 className="text-gray-900 font-medium">No messages yet</h3>
                        <p className="text-gray-500 text-sm mt-1">Start the conversation by sending a message.</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isOutbound = msg.direction === 'OUTBOUND'; // Manager -> Tenant
                        return (
                            <div
                                key={msg.id}
                                className={`flex ${isOutbound ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[70%] rounded-2xl px-5 py-3 shadow-sm ${isOutbound
                                            ? 'bg-blue-600 text-white rounded-br-none'
                                            : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
                                        }`}
                                >
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                    <div
                                        className={`flex items-center gap-1 mt-1.5 text-[11px] ${isOutbound ? 'text-blue-100' : 'text-gray-400'
                                            }`}
                                    >
                                        <span>{format(new Date(msg.createdAt), 'h:mm a')}</span>
                                        {isOutbound && msg.isRead && <span>• Read</span>}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-200">
                <form onSubmit={handleSendMessage} className="flex gap-3">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                    <button
                        type="submit"
                        disabled={isSending || !newMessage.trim()}
                        className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-medium shadow-sm shadow-blue-500/20"
                    >
                        <Send className="w-4 h-4" />
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
}
