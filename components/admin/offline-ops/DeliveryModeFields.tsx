'use client';



import { Input } from '@/components/ui/input';

import { Label } from '@/components/ui/label';

import {

  Select,

  SelectContent,

  SelectItem,

  SelectTrigger,

  SelectValue,

} from '@/components/ui/select';

import VenuePhotoUpload from '@/components/admin/offline-ops/VenuePhotoUpload';



export type DeliveryMode = 'online' | 'onsite' | 'hybrid';



export default function DeliveryModeFields({

  mode,

  meetLink,

  onsiteLocation,

  onsitePhotoUrl,

  onModeChange,

  onMeetLinkChange,

  onLocationChange,

  onPhotoUrlChange,

}: {

  mode: DeliveryMode;

  meetLink: string;

  onsiteLocation: string;

  onsitePhotoUrl: string;

  onModeChange: (m: DeliveryMode) => void;

  onMeetLinkChange: (v: string) => void;

  onLocationChange: (v: string) => void;

  onPhotoUrlChange: (v: string) => void;

}) {

  const showOnline = mode === 'online' || mode === 'hybrid';

  const showOnsite = mode === 'onsite' || mode === 'hybrid';



  return (

    <div className="grid gap-4 md:grid-cols-2">

      <div className="md:col-span-2">

        <Label className="text-slate-700 font-medium">Delivery mode *</Label>

        <Select value={mode} onValueChange={(v) => onModeChange(v as DeliveryMode)}>

          <SelectTrigger className="mt-1 border-[#1B2C4F]/20 max-w-xs">

            <SelectValue />

          </SelectTrigger>

          <SelectContent>

            <SelectItem value="online">Online</SelectItem>

            <SelectItem value="onsite">Onsite</SelectItem>

            <SelectItem value="hybrid">Hybrid</SelectItem>

          </SelectContent>

        </Select>

      </div>



      {showOnline && (

        <div className="md:col-span-2">

          <Label htmlFor="meetLink">Google Meet link *</Label>

          <Input

            id="meetLink"

            value={meetLink}

            onChange={(e) => onMeetLinkChange(e.target.value)}

            placeholder="https://meet.google.com/..."

            className="mt-1 border-[#1B2C4F]/20"

          />

          <p className="text-xs text-slate-500 mt-1">Used for all online sessions in this period.</p>

        </div>

      )}



      {showOnsite && (

        <>

          <div>

            <Label htmlFor="onsiteLocation">Onsite location *</Label>

            <Input

              id="onsiteLocation"

              value={onsiteLocation}

              onChange={(e) => onLocationChange(e.target.value)}

              placeholder="e.g. Bota, Limbe"

              className="mt-1 border-[#1B2C4F]/20"

            />

          </div>

          <div className="md:col-span-2">

            <VenuePhotoUpload value={onsitePhotoUrl} onChange={onPhotoUrlChange} />

          </div>

        </>

      )}

    </div>

  );

}


