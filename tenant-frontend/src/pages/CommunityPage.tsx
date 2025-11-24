import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Users, Megaphone, Calendar, ShoppingBag, MessageCircle, Heart, Share2, Plus, Loader2, X, ThumbsUp } from 'lucide-react';
import { tenant } from '../services/api';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import * as Dialog from '@radix-ui/react-dialog';

export function CommunityPage() {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'announcements' | 'events' | 'marketplace'>('announcements');
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newPost, setNewPost] = useState({ title: '', content: '', category: 'MARKETPLACE' });
    const [creating, setCreating] = useState(false);

    const fetchPosts = async () => {
        try {
            const { data } = await tenant.getCommunityPosts();
            setPosts(data);
        } catch (error) {
            console.error('Failed to fetch posts', error);
            toast.error(t('common.error'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [t]);

    const handleCreatePost = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        try {
            await tenant.createCommunityPost(newPost);
            toast.success(t('community.postCreated'));
            setIsCreateOpen(false);
            setNewPost({ title: '', content: '', category: 'MARKETPLACE' });
            fetchPosts();
        } catch (error) {
            toast.error(t('common.error'));
        } finally {
            setCreating(false);
        }
    };

    const filteredPosts = posts.filter(post => {
        if (activeTab === 'announcements') return post.category === 'ANNOUNCEMENT';
        if (activeTab === 'events') return post.category === 'EVENT';
        return post.category === 'MARKETPLACE';
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">{t('community.title')}</h1>
                    <p className="text-muted-foreground dark:text-gray-400 mt-1">{t('community.subtitle')}</p>
                </div>

                <Dialog.Root open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <Dialog.Trigger asChild>
                        <Button className="shadow-lg shadow-blue-500/20">
                            <Plus className="mr-2 h-4 w-4" /> {t('community.createPost')}
                        </Button>
                    </Dialog.Trigger>
                    <Dialog.Portal>
                        <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg">
                            <div className="flex flex-col space-y-1.5 text-center sm:text-left">
                                <Dialog.Title className="text-lg font-semibold leading-none tracking-tight">{t('community.createPost')}</Dialog.Title>
                                <Dialog.Description className="text-sm text-muted-foreground">
                                    {t('community.shareSomething')}
                                </Dialog.Description>
                            </div>
                            <form onSubmit={handleCreatePost} className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-gray-300">{t('community.postTitle')}</label>
                                    <input
                                        type="text"
                                        required
                                        value={newPost.title}
                                        onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                                        className="flex h-10 w-full rounded-md border border-input dark:border-gray-600 bg-background dark:bg-gray-700 text-foreground dark:text-gray-100 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground dark:placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder={t('community.postTitlePlaceholder')}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-gray-300">{t('community.category')}</label>
                                    <select
                                        value={newPost.category}
                                        onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                                        className="flex h-10 w-full rounded-md border border-input dark:border-gray-600 bg-background dark:bg-gray-700 text-foreground dark:text-gray-100 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground dark:placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="MARKETPLACE">{t('community.marketplace')}</option>
                                        <option value="ANNOUNCEMENT">{t('community.announcements')}</option>
                                        <option value="EVENT">{t('community.events')}</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-gray-300">{t('community.content')}</label>
                                    <textarea
                                        required
                                        value={newPost.content}
                                        onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                                        className="flex min-h-[80px] w-full rounded-md border border-input dark:border-gray-600 bg-background dark:bg-gray-700 text-foreground dark:text-gray-100 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground dark:placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder={t('community.contentPlaceholder')}
                                    />
                                </div>
                                <div className="flex justify-end gap-3">
                                    <Dialog.Close asChild>
                                        <Button type="button" variant="ghost">{t('common.cancel')}</Button>
                                    </Dialog.Close>
                                    <Button type="submit" disabled={creating}>
                                        {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                        {t('community.post')}
                                    </Button>
                                </div>
                            </form>
                            <Dialog.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                                <X className="h-4 w-4" />
                                <span className="sr-only">Close</span>
                            </Dialog.Close>
                        </Dialog.Content>
                    </Dialog.Portal>
                </Dialog.Root>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 rounded-xl bg-gray-100 p-1">
                <button
                    onClick={() => setActiveTab('announcements')}
                    className={`flex-1 flex items-center justify-center rounded-lg py-2.5 text-sm font-medium leading-5 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2 ${activeTab === 'announcements'
                        ? 'bg-white text-blue-700 shadow'
                        : 'text-gray-500 hover:bg-white/[0.12] hover:text-gray-700'
                        }`}
                >
                    <Megaphone className="w-4 h-4 mr-2" />
                    {t('community.announcements')}
                </button>
                <button
                    onClick={() => setActiveTab('events')}
                    className={`flex-1 flex items-center justify-center rounded-lg py-2.5 text-sm font-medium leading-5 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2 ${activeTab === 'events'
                        ? 'bg-white text-blue-700 shadow'
                        : 'text-gray-500 hover:bg-white/[0.12] hover:text-gray-700'
                        }`}
                >
                    <Calendar className="w-4 h-4 mr-2" />
                    {t('community.events')}
                </button>
                <button
                    onClick={() => setActiveTab('marketplace')}
                    className={`flex-1 flex items-center justify-center rounded-lg py-2.5 text-sm font-medium leading-5 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2 ${activeTab === 'marketplace'
                        ? 'bg-white text-blue-700 shadow'
                        : 'text-gray-500 hover:bg-white/[0.12] hover:text-gray-700'
                        }`}
                >
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    {t('community.marketplace')}
                </button>
            </div>

            {/* Content */}
            <motion.div 
                className="space-y-6"
                initial="hidden"
                animate="show"
                variants={{
                    hidden: { opacity: 0 },
                    show: {
                        opacity: 1,
                        transition: {
                            staggerChildren: 0.1
                        }
                    }
                }}
            >
                {filteredPosts.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <div className="p-4 bg-gray-100 rounded-full mb-4">
                                <Megaphone className="h-12 w-12 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('community.noPosts')}</h3>
                            <p className="text-sm text-gray-500 text-center max-w-sm">
                                {activeTab === 'announcements' && t('community.noAnnouncements')}
                                {activeTab === 'events' && t('community.noEvents')}
                                {activeTab === 'marketplace' && t('community.noMarketplace')}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    filteredPosts.map((post, index) => (
                        <motion.div
                            key={post.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className="hover:shadow-lg transition-shadow duration-200">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                                                {post.author?.name?.[0]?.toUpperCase() || 'U'}
                                            </div>
                                            <div>
                                                <CardTitle className="text-base font-semibold">{post.author?.name || 'Unknown User'}</CardTitle>
                                                <CardDescription className="flex items-center gap-2 mt-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {format(new Date(post.createdAt), 'MMM d, yyyy • h:mm a')}
                                                </CardDescription>
                                            </div>
                                        </div>
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                            post.category === 'ANNOUNCEMENT' ? 'bg-blue-100 text-blue-800' :
                                            post.category === 'EVENT' ? 'bg-purple-100 text-purple-800' :
                                            'bg-green-100 text-green-800'
                                        }`}>
                                            {post.category}
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <h3 className="text-xl font-bold mb-3 text-gray-900">{post.title}</h3>
                                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{post.content}</p>
                                </CardContent>
                                <CardFooter className="border-t bg-gray-50/50 px-6 py-4">
                                    <div className="flex gap-6 w-full">
                                        <button className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-red-600 transition-colors group">
                                            <Heart className={`w-4 h-4 transition-transform group-hover:scale-110 ${false ? 'fill-red-500 text-red-500' : ''}`} />
                                            <span>{t('community.like')}</span>
                                            {false && <span className="text-xs">(1)</span>}
                                        </button>
                                        <button className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors group">
                                            <MessageCircle className="w-4 h-4 transition-transform group-hover:scale-110" />
                                            <span>{t('community.comment')}</span>
                                        </button>
                                        <button className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors ml-auto group">
                                            <Share2 className="w-4 h-4 transition-transform group-hover:scale-110" />
                                            <span>{t('community.share')}</span>
                                        </button>
                                    </div>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    ))
                )}
            </motion.div>
        </div>
    );
}
