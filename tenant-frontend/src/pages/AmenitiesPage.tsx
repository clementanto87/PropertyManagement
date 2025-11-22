import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Calendar as CalendarIcon, Clock, Users, CheckCircle2, Loader2 } from 'lucide-react';
import { tenant } from '../services/api';
import { toast } from 'sonner';

export function AmenitiesPage() {
    const [amenities, setAmenities] = useState<any[]>([]);
    const [myBookings, setMyBookings] = useState<any[]>([]);
    const [selectedAmenity, setSelectedAmenity] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [bookingLoading, setBookingLoading] = useState(false);

    const fetchData = async () => {
        try {
            const [amenitiesData, bookingsData] = await Promise.all([
                tenant.getAmenities(),
                tenant.getBookings()
            ]);
            setAmenities(amenitiesData.data);
            setMyBookings(bookingsData.data);
        } catch (error) {
            console.error('Failed to fetch amenities data', error);
            toast.error('Failed to load amenities');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleBook = async () => {
        if (!selectedAmenity || !selectedDate || !selectedTime) return;

        setBookingLoading(true);
        try {
            // Construct start and end times (simplified for demo)
            // In a real app, you'd parse the date and time strings properly
            const now = new Date();
            const startTime = new Date(now.setDate(now.getDate() + (selectedDate === 'Tomorrow' ? 1 : 0)));
            // This is a mock implementation of date parsing

            await tenant.createBooking({
                amenityId: selectedAmenity,
                startTime: new Date().toISOString(), // Mock: current time
                endTime: new Date(Date.now() + 3600000).toISOString() // Mock: +1 hour
            });

            toast.success('Booking confirmed!');
            setSelectedAmenity(null);
            setSelectedDate('');
            setSelectedTime('');
            fetchData(); // Refresh bookings
        } catch (error) {
            toast.error('Failed to create booking');
        } finally {
            setBookingLoading(false);
        }
    };

    const timeSlots = [
        '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Amenities</h1>
                <p className="text-muted-foreground mt-1">Book shared facilities and manage your reservations.</p>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Amenities List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        {amenities.length === 0 ? (
                            <div className="col-span-full text-center py-12 text-muted-foreground">
                                No amenities available.
                            </div>
                        ) : (
                            amenities.map((amenity) => (
                                <Card
                                    key={amenity.id}
                                    className={`overflow-hidden cursor-pointer transition-all hover:shadow-md ${selectedAmenity === amenity.id ? 'ring-2 ring-blue-500' : ''}`}
                                    onClick={() => setSelectedAmenity(amenity.id)}
                                >
                                    <div className="h-48 bg-gray-200 relative">
                                        {/* Placeholder image logic since we don't have real images in DB yet */}
                                        <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-500">
                                            No Image
                                        </div>
                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                                            <h3 className="text-white font-bold text-lg">{amenity.name}</h3>
                                        </div>
                                    </div>
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                            <div className="flex items-center">
                                                <Users className="w-4 h-4 mr-1" /> Max {amenity.maxCapacity || 'N/A'}
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-500 line-clamp-2">{amenity.description}</p>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>

                    {/* Booking Section (Visible when amenity selected) */}
                    {selectedAmenity && (
                        <Card className="border-blue-200 bg-blue-50/50">
                            <CardHeader>
                                <CardTitle>Book {amenities.find(a => a.id === selectedAmenity)?.name}</CardTitle>
                                <CardDescription>Select a date and time for your reservation.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
                                    <div className="flex gap-2 overflow-x-auto pb-2">
                                        {['Today', 'Tomorrow'].map((date) => (
                                            <button
                                                key={date}
                                                onClick={() => setSelectedDate(date)}
                                                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium border ${selectedDate === date
                                                    ? 'bg-blue-600 text-white border-blue-600'
                                                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                                                    }`}
                                            >
                                                {date}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {selectedDate && (
                                    <div className="animate-in fade-in slide-in-from-top-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Available Times</label>
                                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                                            {timeSlots.map((time) => (
                                                <button
                                                    key={time}
                                                    onClick={() => setSelectedTime(time)}
                                                    className={`px-2 py-2 rounded-md text-sm border transition-colors ${selectedTime === time
                                                            ? 'bg-blue-600 text-white border-blue-600'
                                                            : 'border-gray-200 bg-white hover:border-blue-400 hover:text-blue-600'
                                                        }`}
                                                >
                                                    {time}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter>
                                <Button
                                    className="w-full"
                                    disabled={!selectedDate || !selectedTime || bookingLoading}
                                    onClick={handleBook}
                                >
                                    {bookingLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Confirm Booking
                                </Button>
                            </CardFooter>
                        </Card>
                    )}
                </div>

                {/* Sidebar - My Bookings */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>My Bookings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {myBookings.length === 0 ? (
                                <div className="text-center py-8 text-gray-500 text-sm">
                                    No upcoming bookings.
                                </div>
                            ) : (
                                myBookings.map((booking) => (
                                    <div key={booking.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                                        <div className="p-2 bg-white rounded-md border border-gray-200">
                                            <CalendarIcon className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate">{booking.amenity?.name}</p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(booking.startTime).toLocaleDateString()} • {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                            <div className="mt-1 flex items-center">
                                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {booking.status === 'CONFIRMED' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                                                    {booking.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
