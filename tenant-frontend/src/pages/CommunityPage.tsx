import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Users, Megaphone, Calendar, ShoppingBag, MessageCircle, Heart, Share2, Plus, Loader2, X } from 'lucide-react';
import { tenant } from '../services/api';
import { toast } from 'sonner';
import * as Dialog from '@radix-ui/react-dialog';

export function CommunityPage() {
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
            toast.error('Failed to load community posts');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleCreatePost = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        try {
            await tenant.createCommunityPost(newPost);
            toast.success('Post created successfully!');
            setIsCreateOpen(false);
            setNewPost({ title: '', content: '', category: 'MARKETPLACE' });
            fetchPosts();
        } catch (error) {
            toast.error('Failed to create post');
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
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Community</h1>
                    <p className="text-muted-foreground mt-1">Connect with your neighbors and stay updated.</p>
                </div>

                <Dialog.Root open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <Dialog.Trigger asChild>
                        <Button className="shadow-lg shadow-blue-500/20">
                            <Plus className="mr-2 h-4 w-4" /> Create Post
                        </Button>
                    </Dialog.Trigger>
                    <Dialog.Portal>
                        <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg">
                            <div className="flex flex-col space-y-1.5 text-center sm:text-left">
                                <Dialog.Title className="text-lg font-semibold leading-none tracking-tight">Create New Post</Dialog.Title>
                                <Dialog.Description className="text-sm text-muted-foreground">
                                    Share something with your community.
                                </Dialog.Description>
                            </div>
                            <form onSubmit={handleCreatePost} className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Title</label>
                                    <input
                                        type="text"
                                        required
                                        value={newPost.title}
                                        onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="What's on your mind?"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Category</label>
                                    <select
                                        value={newPost.category}
                                        onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="MARKETPLACE">Marketplace</option>
                                        <option value="ANNOUNCEMENT">Announcement</option>
                                        <option value="EVENT">Event</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Content</label>
                                    <textarea
                                        required
                                        value={newPost.content}
                                        onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="Write your post content..."
                                    />
                                </div>
                                <div className="flex justify-end gap-3">
                                    <Dialog.Close asChild>
                                        <Button type="button" variant="ghost">Cancel</Button>
                                    </Dialog.Close>
                                    <Button type="submit" disabled={creating}>
                                        {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                        Post
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
                    Announcements
                </button>
                <button
                    onClick={() => setActiveTab('events')}
                    className={`flex-1 flex items-center justify-center rounded-lg py-2.5 text-sm font-medium leading-5 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2 ${activeTab === 'events'
                        ? 'bg-white text-blue-700 shadow'
                        : 'text-gray-500 hover:bg-white/[0.12] hover:text-gray-700'
                        }`}
                >
                    <Calendar className="w-4 h-4 mr-2" />
                    Events
                </button>
                <button
                    onClick={() => setActiveTab('marketplace')}
                    className={`flex-1 flex items-center justify-center rounded-lg py-2.5 text-sm font-medium leading-5 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2 ${activeTab === 'marketplace'
                        ? 'bg-white text-blue-700 shadow'
                        : 'text-gray-500 hover:bg-white/[0.12] hover:text-gray-700'
                        }`}
                >
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Marketplace
                </button>
            </div>

            {/* Content */}
            <div className="space-y-6">
                {filteredPosts.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        No posts found in this category. Be the first to post!
                    </div>
                ) : (
                    filteredPosts.map((post) => (
                        <Card key={post.id}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                            {post.author?.name?.[0] || 'U'}
                                        </div>
                                        <div>
                                            <CardTitle className="text-base">{post.author?.name || 'Unknown User'}</CardTitle>
                                            <CardDescription>{new Date(post.createdAt).toLocaleDateString()}</CardDescription>
                                        </div>
                                    </div>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                        {post.category}
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
                                <p className="text-gray-600 whitespace-pre-wrap">{post.content}</p>
                            </CardContent>
                            <CardFooter className="border-t bg-gray-50/50 px-6 py-3">
                                <div className="flex gap-4 w-full">
                                    <button className="flex items-center text-sm text-gray-500 hover:text-red-500 transition-colors">
                                        <Heart className="w-4 h-4 mr-1.5" /> Like
                                    </button>
                                    <button className="flex items-center text-sm text-gray-500 hover:text-blue-500 transition-colors">
                                        <MessageCircle className="w-4 h-4 mr-1.5" /> Comment
                                    </button>
                                    <button className="flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors ml-auto">
                                        <Share2 className="w-4 h-4 mr-1.5" /> Share
                                    </button>
                                </div>
                            </CardFooter>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
