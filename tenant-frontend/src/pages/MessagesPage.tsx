import { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { format } from 'date-fns';
import { apiClient } from '../lib/api';

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

export function MessagesPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const fetchMessages = async () => {
        try {
            // The backend endpoint handles tenant context automatically
            const response = await apiClient.get<Message[]>('/communications/messages/list');
            setMessages(response.data);
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
    }, []);

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
            await apiClient.post('/communications/messages', {
                content: newMessage,
            });
            setNewMessage('');
            fetchMessages(); // Refresh immediately
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Messages</h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Communicate with your property manager
                </p>
            </div>

            <div className="flex flex-col h-[600px] bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50 dark:bg-gray-900/50">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-full text-gray-500 dark:text-gray-400">
                            Loading messages...
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Send className="h-8 w-8 text-blue-400" />
                            </div>
                            <h3 className="text-gray-900 dark:text-white font-medium">No messages yet</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                                Start the conversation by sending a message.
                            </p>
                        </div>
                    ) : (
                        messages.map((msg) => {
                            // Wait, backend logic:
                            // Tenant sends -> direction = INBOUND
                            // Manager sends -> direction = OUTBOUND

                            // So:
                            // msg.direction === 'INBOUND' => Sent by Tenant (Me) => Right side
                            // msg.direction === 'OUTBOUND' => Sent by Manager (Them) => Left side

                            const isMyMessage = msg.direction === 'INBOUND';

                            return (
                                <div
                                    key={msg.id}
                                    className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`flex flex-col max-w-[70%] ${isMyMessage ? 'items-end' : 'items-start'}`}>
                                        <div
                                            className={`rounded-2xl px-5 py-3 shadow-sm ${isMyMessage
                                                ? 'bg-blue-600 text-white rounded-br-none'
                                                : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-100 rounded-bl-none'
                                                }`}
                                        >
                                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                        </div>
                                        <div className="flex items-center gap-1 mt-1.5 text-[11px] text-gray-400">
                                            {!isMyMessage && <span className="font-medium mr-1">Property Manager</span>}
                                            <span>{format(new Date(msg.createdAt), 'h:mm a')}</span>
                                            {isMyMessage && msg.isRead && <span>• Read</span>}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                    <form onSubmit={handleSendMessage} className="flex gap-3">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-white transition-all"
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
        </div>
    );
}
