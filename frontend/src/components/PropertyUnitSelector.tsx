import React, { useState, useEffect, useMemo } from 'react';
import { api } from '@/lib/api';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, ChevronDown, ChevronRight, Building, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Property {
    id: string;
    name: string;
    units: { id: string; unitNumber: string }[];
}

interface PropertyUnitSelectorProps {
    selectedProperties: string[];
    selectedUnits: string[];
    onPropertiesChange: (properties: string[]) => void;
    onUnitsChange: (units: string[]) => void;
}

export function PropertyUnitSelector({
    selectedProperties,
    selectedUnits,
    onPropertiesChange,
    onUnitsChange
}: PropertyUnitSelectorProps) {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedProperties, setExpandedProperties] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetchProperties();
    }, []);

    const fetchProperties = async () => {
        try {
            const data = await api.get<{ items: Property[] }>('/properties?include=units');
            setProperties(data.items);
        } catch (error) {
            console.error('Failed to fetch properties:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredProperties = useMemo(() => {
        if (!searchQuery) return properties;
        return properties.filter(p =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.units.some(u => u.unitNumber.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [properties, searchQuery]);

    const togglePropertyExpand = (propertyId: string) => {
        const newExpanded = new Set(expandedProperties);
        if (newExpanded.has(propertyId)) {
            newExpanded.delete(propertyId);
        } else {
            newExpanded.add(propertyId);
        }
        setExpandedProperties(newExpanded);
    };

    const handlePropertyToggle = (propertyId: string, checked: boolean) => {
        const property = properties.find(p => p.id === propertyId);
        if (!property) return;

        if (checked) {
            // Select property and all its units
            if (!selectedProperties.includes(propertyId)) {
                onPropertiesChange([...selectedProperties, propertyId]);
            }
            const newUnits = [...selectedUnits];
            property.units.forEach(u => {
                if (!newUnits.includes(u.id)) {
                    newUnits.push(u.id);
                }
            });
            onUnitsChange(newUnits);
            // Auto-expand when selecting
            if (!expandedProperties.has(propertyId)) {
                togglePropertyExpand(propertyId);
            }
        } else {
            // Deselect property and all its units
            onPropertiesChange(selectedProperties.filter(id => id !== propertyId));
            const unitIdsToRemove = new Set(property.units.map(u => u.id));
            onUnitsChange(selectedUnits.filter(id => !unitIdsToRemove.has(id)));
        }
    };

    const handleUnitToggle = (unitId: string, checked: boolean, propertyId: string) => {
        const property = properties.find(p => p.id === propertyId);
        if (!property) return;

        if (checked) {
            // Adding a unit
            const newUnits = [...selectedUnits, unitId];
            onUnitsChange(newUnits);

            // Check if all units are now selected
            const allUnitsSelected = property.units.every(u => newUnits.includes(u.id));
            if (allUnitsSelected) {
                if (!selectedProperties.includes(propertyId)) {
                    onPropertiesChange([...selectedProperties, propertyId]);
                }
            }
        } else {
            // Removing a unit
            let newUnits = selectedUnits.filter(id => id !== unitId);

            // If property was previously selected, it means we implicitly had ALL units.
            // Since we are unchecking one, we must explicitly keep the OTHERS.
            if (selectedProperties.includes(propertyId)) {
                // Add all other units of this property to newUnits if not already present
                const otherUnits = property.units.filter(u => u.id !== unitId).map(u => u.id);
                newUnits = [...new Set([...newUnits, ...otherUnits])];

                // And DESELECT the property
                onPropertiesChange(selectedProperties.filter(id => id !== propertyId));
            }

            onUnitsChange(newUnits);
        }
    };

    const getPropertySelectionState = (property: Property) => {
        // If property is explicitly selected, it's 'all'
        if (selectedProperties.includes(property.id)) return 'all';

        const propertyUnits = property.units.map(u => u.id);
        const selectedPropertyUnits = propertyUnits.filter(id => selectedUnits.includes(id));

        if (selectedPropertyUnits.length === 0) return 'none';
        if (selectedPropertyUnits.length === propertyUnits.length) return 'all';
        return 'some';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[300px] border rounded-md bg-muted/10">
                <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-muted-foreground">Loading properties...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="border rounded-xl overflow-hidden bg-card shadow-sm">
            {/* Header with Search and Summary */}
            <div className="p-4 border-b bg-muted/30 space-y-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search properties or units..."
                        className="pl-9 bg-background"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="secondary" className="font-normal">
                        {selectedProperties.length} Properties
                    </Badge>
                    <Badge variant="secondary" className="font-normal">
                        {selectedUnits.length} Units
                    </Badge>
                    <span className="ml-auto">
                        {filteredProperties.length} results
                    </span>
                </div>
            </div>

            {/* Scrollable List */}
            <div className="h-[300px] overflow-y-auto p-2 space-y-1">
                {filteredProperties.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        <Building className="h-8 w-8 mb-2 opacity-20" />
                        <p className="text-sm">No properties found</p>
                    </div>
                ) : (
                    filteredProperties.map(property => {
                        const selectionState = getPropertySelectionState(property);
                        const isExpanded = expandedProperties.has(property.id);
                        const isPropertySelected = selectedProperties.includes(property.id);

                        return (
                            <div key={property.id} className="border rounded-lg bg-background overflow-hidden transition-all">
                                <div className={cn(
                                    "flex items-center p-2 hover:bg-muted/50 transition-colors",
                                    isExpanded && "bg-muted/30"
                                )}>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 mr-2 shrink-0"
                                        onClick={() => togglePropertyExpand(property.id)}
                                    >
                                        {isExpanded ? (
                                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                        ) : (
                                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                        )}
                                    </Button>

                                    <Checkbox
                                        id={`prop-${property.id}`}
                                        checked={selectionState === 'all'}
                                        // Use indeterminate state visually if needed, but Checkbox component might not support it directly via props easily without ref
                                        // For now, 'some' state will just be unchecked or we can rely on unit checkboxes
                                        // Better UX: If 'some', maybe show a dash? 
                                        // Standard Checkbox usually takes 'checked' as boolean | 'indeterminate'
                                        // Let's assume our UI lib Checkbox supports standard Radix behavior
                                        className={cn(selectionState === 'some' && "data-[state=checked]:bg-primary/50")}
                                        onCheckedChange={(checked) => handlePropertyToggle(property.id, checked as boolean)}
                                    />

                                    <Label
                                        htmlFor={`prop-${property.id}`}
                                        className="flex-1 ml-3 font-medium cursor-pointer py-1"
                                    >
                                        {property.name}
                                        <span className="ml-2 text-xs text-muted-foreground font-normal">
                                            ({property.units.length} units)
                                        </span>
                                    </Label>
                                </div>

                                {isExpanded && (
                                    <div className="pl-11 pr-2 pb-2 pt-1 grid grid-cols-2 gap-2 animate-in slide-in-from-top-1 duration-200">
                                        {property.units.map(unit => {
                                            const isUnitSelected = isPropertySelected || selectedUnits.includes(unit.id);
                                            return (
                                                <div
                                                    key={unit.id}
                                                    className="flex items-center space-x-2 p-1.5 rounded-md hover:bg-muted/50 transition-colors"
                                                >
                                                    <Checkbox
                                                        id={`unit-${unit.id}`}
                                                        checked={isUnitSelected}
                                                        onCheckedChange={(checked) => handleUnitToggle(unit.id, checked as boolean, property.id)}
                                                    />
                                                    <Label
                                                        htmlFor={`unit-${unit.id}`}
                                                        className="text-sm text-muted-foreground cursor-pointer flex-1"
                                                    >
                                                        Unit {unit.unitNumber}
                                                    </Label>
                                                </div>
                                            );
                                        })}
                                        {property.units.length === 0 && (
                                            <p className="text-xs text-muted-foreground col-span-2 py-2 italic">
                                                No units available in this property
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
