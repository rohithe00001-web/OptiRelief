import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { GlassCard } from '@/components/ui/GlassCard';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Building2, 
  MapPin, 
  Users, 
  Phone 
} from 'lucide-react';
import { toast } from 'sonner';

interface Shelter {
  id: string;
  name: string;
  address: string | null;
  latitude: number;
  longitude: number;
  capacity: number;
  current_occupancy: number;
  status: string;
  contact_phone: string | null;
  amenities: string[] | null;
}

interface ShelterManagerProps {
  onSheltersChange?: (shelters: Shelter[]) => void;
}

export function ShelterManager({ onSheltersChange }: ShelterManagerProps) {
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingShelter, setEditingShelter] = useState<Shelter | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    latitude: '',
    longitude: '',
    capacity: '100',
    current_occupancy: '0',
    status: 'open',
    contact_phone: '',
    amenities: '',
  });

  useEffect(() => {
    fetchShelters();

    const channel = supabase
      .channel('shelters-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shelters' }, () => {
        fetchShelters();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    onSheltersChange?.(shelters);
  }, [shelters, onSheltersChange]);

  const fetchShelters = async () => {
    const { data, error } = await supabase
      .from('shelters')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to fetch shelters');
      console.error(error);
    } else {
      setShelters(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const shelterData = {
      name: formData.name,
      address: formData.address || null,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      capacity: parseInt(formData.capacity),
      current_occupancy: parseInt(formData.current_occupancy),
      status: formData.status,
      contact_phone: formData.contact_phone || null,
      amenities: formData.amenities ? formData.amenities.split(',').map(a => a.trim()) : null,
    };

    if (editingShelter) {
      const { error } = await supabase
        .from('shelters')
        .update(shelterData)
        .eq('id', editingShelter.id);

      if (error) {
        toast.error('Failed to update shelter');
        console.error(error);
      } else {
        toast.success('Shelter updated');
      }
    } else {
      const { error } = await supabase
        .from('shelters')
        .insert([shelterData]);

      if (error) {
        toast.error('Failed to add shelter');
        console.error(error);
      } else {
        toast.success('Shelter added');
      }
    }

    resetForm();
    setDialogOpen(false);
  };

  const handleEdit = (shelter: Shelter) => {
    setEditingShelter(shelter);
    setFormData({
      name: shelter.name,
      address: shelter.address || '',
      latitude: shelter.latitude.toString(),
      longitude: shelter.longitude.toString(),
      capacity: shelter.capacity.toString(),
      current_occupancy: shelter.current_occupancy.toString(),
      status: shelter.status,
      contact_phone: shelter.contact_phone || '',
      amenities: shelter.amenities?.join(', ') || '',
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('shelters').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete shelter');
      console.error(error);
    } else {
      toast.success('Shelter deleted');
    }
  };

  const resetForm = () => {
    setEditingShelter(null);
    setFormData({
      name: '',
      address: '',
      latitude: '',
      longitude: '',
      capacity: '100',
      current_occupancy: '0',
      status: 'open',
      contact_phone: '',
      amenities: '',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'full': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'closed': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getOccupancyPercent = (shelter: Shelter) => {
    return Math.round((shelter.current_occupancy / shelter.capacity) * 100);
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading shelters...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Building2 className="w-5 h-5 text-emerald-400" />
          Shelter Management
        </h3>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-1" /> Add Shelter
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingShelter ? 'Edit Shelter' : 'Add New Shelter'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Shelter name"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Label>Address</Label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Full address"
                  />
                </div>
                <div>
                  <Label>Latitude *</Label>
                  <Input
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    placeholder="e.g. 12.9750"
                    required
                  />
                </div>
                <div>
                  <Label>Longitude *</Label>
                  <Input
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    placeholder="e.g. 77.6070"
                    required
                  />
                </div>
                <div>
                  <Label>Capacity</Label>
                  <Input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    placeholder="100"
                  />
                </div>
                <div>
                  <Label>Current Occupancy</Label>
                  <Input
                    type="number"
                    value={formData.current_occupancy}
                    onChange={(e) => setFormData({ ...formData, current_occupancy: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="full">Full</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Contact Phone</Label>
                  <Input
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                    placeholder="+91 ..."
                  />
                </div>
                <div className="col-span-2">
                  <Label>Amenities (comma-separated)</Label>
                  <Input
                    value={formData.amenities}
                    onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                    placeholder="water, food, medical, beds"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">
                {editingShelter ? 'Update Shelter' : 'Add Shelter'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3">
        {shelters.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No shelters registered. Add your first shelter above.
          </div>
        ) : (
          shelters.map((shelter) => (
            <GlassCard key={shelter.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium">{shelter.name}</h4>
                    <Badge className={getStatusColor(shelter.status)}>
                      {shelter.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {shelter.address || `${shelter.latitude.toFixed(4)}, ${shelter.longitude.toFixed(4)}`}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {shelter.current_occupancy}/{shelter.capacity} ({getOccupancyPercent(shelter)}%)
                    </div>
                    {shelter.contact_phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {shelter.contact_phone}
                      </div>
                    )}
                  </div>
                  {shelter.amenities && shelter.amenities.length > 0 && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {shelter.amenities.map((amenity, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(shelter)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(shelter.id)}>
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </Button>
                </div>
              </div>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
}
