import { useEffect, useMemo, useState } from 'react';
import { CarFront, Check, ChevronLeft, Copy, Search, X } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { Badge } from './components/ui/badge';
import { Button } from './components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from './components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle
} from './components/ui/drawer';
import { Input } from './components/ui/input';
import {
  englishLetters,
  INSURANCE_FILTERS,
  INSURANCE_LABEL,
  type InsuranceStatus,
  type Vehicle,
  VEHICLES
} from './data/vehicles';

const INSURANCE_STYLE: Record<InsuranceStatus, string> = {
  Valid: 'bg-emerald-500',
  Expired: 'bg-red-500',
  'Not Exist': 'bg-neutral-400'
};

function useDesktopLayout() {
  const [desktop, setDesktop] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(min-width: 768px)');
    const update = () => setDesktop(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return desktop;
}

function normalize(value: string) {
  return value
    .toLocaleLowerCase()
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/\s+/g, ' ')
    .trim();
}

function searchableText(vehicle: Vehicle) {
  return normalize(
    [
      vehicle.plateNumber,
      vehicle.arabicLetters.join(' '),
      vehicle.arabicLetters.join(''),
      englishLetters(vehicle.arabicLetters).join(' '),
      englishLetters(vehicle.arabicLetters).join('')
    ].join(' ')
  );
}

function PlateCard({ vehicle, onSelect }: { vehicle: Vehicle; onSelect: () => void }) {
  const english = englishLetters(vehicle.arabicLetters);

  return (
    <button
      className="group flex min-w-0 items-stretch overflow-hidden rounded-2xl border border-stone-300 bg-white text-center text-stone-900 shadow-sm transition hover:-translate-y-0.5 hover:border-stone-400 hover:shadow-md active:scale-[.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      type="button"
      dir="ltr"
      onClick={onSelect}
      aria-label={`تفاصيل لوحة ${vehicle.plateNumber} ${vehicle.arabicLetters.join(' ')}`}
    >
      <span className="flex min-w-0 flex-1 flex-col justify-center">
        <span className="flex min-h-12 items-center justify-center gap-3 border-b-2 border-stone-900 px-3 py-2 text-xl font-bold tracking-widest">
          <span>{english.join(' ')}</span>
          <span>{vehicle.plateNumber}</span>
        </span>
        <span
          className="flex min-h-12 items-center justify-center gap-3 px-3 py-2 text-xl font-bold"
          dir="rtl"
        >
          <span>{vehicle.plateNumber}</span>
          <span>{vehicle.arabicLetters.join(' ')}</span>
        </span>
      </span>
      <span
        className="flex w-11 shrink-0 flex-col items-center justify-center gap-1 bg-stone-900 px-1 py-2 text-white"
        aria-hidden="true"
      >
        <span className="font-sans text-[9px] font-bold tracking-widest">KSA</span>
        <span className="text-[9px] font-semibold [writing-mode:vertical-rl]">السعودية</span>
        <span className={`mt-1 h-2 w-2 rounded-full ${INSURANCE_STYLE[vehicle.insurance]}`} />
      </span>
      <ChevronLeft className="my-auto ml-2 mr-1 h-4 w-4 shrink-0 text-muted-foreground transition group-hover:text-foreground" aria-hidden="true" />
    </button>
  );
}

type DetailField = { label: string; value: string; ltr?: boolean };

function vehicleFields(vehicle: Vehicle): DetailField[] {
  return [
    { label: 'رقم اللوحة', value: `${vehicle.plateNumber} ${vehicle.arabicLetters.join(' ')}` },
    { label: 'اللوحة بالإنجليزية', value: `${englishLetters(vehicle.arabicLetters).join(' ')} ${vehicle.plateNumber}`, ltr: true },
    { label: 'نوع التسجيل', value: vehicle.registrationType },
    { label: 'نوع الهيكل', value: vehicle.bodyType, ltr: true },
    { label: 'الماركة', value: vehicle.make },
    { label: 'الطراز', value: vehicle.model },
    { label: 'سنة الصنع', value: vehicle.year, ltr: true },
    { label: 'الرقم التسلسلي', value: vehicle.serialNumber, ltr: true },
    { label: 'اللون الأساسي', value: vehicle.color },
    { label: 'تاريخ انتهاء رخصة السير', value: vehicle.licenseExpiry, ltr: true },
    { label: 'هوية المستخدم الفعلي', value: vehicle.userId, ltr: true },
    { label: 'اسم المستخدم الفعلي', value: vehicle.userName, ltr: true },
    { label: 'رقم الهيكل (Chassis)', value: vehicle.chassis, ltr: true },
    { label: 'حالة التأمين', value: INSURANCE_LABEL[vehicle.insurance] },
    { label: 'وضع المركبة', value: vehicle.status },
    { label: 'تاريخ الملكية', value: vehicle.ownershipDate, ltr: true }
  ];
}

async function copyText(label: string, value: string) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(value);
    } else {
      const area = document.createElement('textarea');
      area.value = value;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.append(area);
      area.select();

      const copied = document.execCommand('copy');
      area.remove();
      if (!copied) throw new Error('Clipboard copy was rejected');
    }

    toast.success('تم النسخ بنجاح', { description: `${label}: ${value}` });
    return true;
  } catch {
    toast.error('تعذر النسخ', { description: 'يرجى المحاولة مرة أخرى.' });
    return false;
  }
}

function VehicleDetails({ vehicle }: { vehicle: Vehicle }) {
  const [copied, setCopied] = useState<string | null>(null);
  const fields = useMemo(() => vehicleFields(vehicle), [vehicle]);

  useEffect(() => {
    if (!copied) return;
    const timeout = window.setTimeout(() => setCopied(null), 1400);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  const handleCopy = async (field: DetailField) => {
    if (await copyText(field.label, field.value)) setCopied(field.label);
  };

  return (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
      {fields.map((field) => (
        <div
          className="flex min-h-[68px] min-w-0 items-center justify-between gap-3 rounded-2xl border bg-muted/40 p-3"
          key={field.label}
        >
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="text-xs text-muted-foreground">{field.label}</span>
            <span
              className={`break-words text-sm font-semibold text-foreground${field.ltr ? ' text-left' : ''}`}
              dir={field.ltr ? 'ltr' : 'rtl'}
            >
              {field.value || '—'}
            </span>
          </div>
          <Button
            className="h-9 w-9 shrink-0 rounded-full"
            size="icon"
            type="button"
            disabled={!field.value}
            onClick={() => void handleCopy(field)}
            aria-label={`نسخ ${field.label}`}
            title={`نسخ ${field.label}`}
          >
            {copied === field.label ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      ))}
    </div>
  );
}

function VehicleHeading({ vehicle }: { vehicle: Vehicle }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground">
        <CarFront className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <DialogTitle className="text-lg font-bold">تفاصيل المركبة</DialogTitle>
        <DialogDescription>
          {vehicle.plateNumber} {vehicle.arabicLetters.join(' ')}
        </DialogDescription>
      </div>
    </div>
  );
}

export default function App() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<(typeof INSURANCE_FILTERS)[number]>('الكل');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const desktop = useDesktopLayout();

  const filteredVehicles = useMemo(() => {
    const normalizedQuery = normalize(query);
    return VEHICLES.filter((vehicle) => {
      const insuranceMatches =
        filter === 'الكل' || INSURANCE_LABEL[vehicle.insurance] === filter;
      return insuranceMatches && (!normalizedQuery || searchableText(vehicle).includes(normalizedQuery));
    });
  }, [filter, query]);

  const setOpen = (open: boolean) => {
    if (!open) setSelectedVehicle(null);
  };

  return (
    <div className="min-h-screen bg-background pb-[env(safe-area-inset-bottom)]" dir="rtl">
      <header className="sticky top-0 z-30 border-b bg-background/90 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
        <div className="mx-auto w-[min(100%-2rem,1120px)] space-y-3 py-3.5">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground">
              <CarFront className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">إدارة الأسطول</p>
              <h1 className="text-lg font-bold leading-tight">المركبات</h1>
            </div>
            <Badge className="mr-auto border-border bg-white text-muted-foreground" variant="outline">
              {VEHICLES.length} مركبة
            </Badge>
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" aria-hidden="true" />
            <Input
              className="h-12 rounded-2xl border-stone-800 bg-stone-900 pr-11 pl-11 text-white placeholder:text-stone-400 focus-visible:ring-stone-500 focus-visible:ring-offset-background"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="ابحث برقم اللوحة أو الحروف..."
              aria-label="ابحث برقم اللوحة أو الحروف"
              autoComplete="off"
              dir="rtl"
            />
            {query && (
              <Button
                className="absolute left-2 top-1/2 h-8 w-8 -translate-y-1/2 text-stone-300 hover:bg-stone-700 hover:text-white"
                variant="ghost"
                size="icon"
                onClick={() => setQuery('')}
                aria-label="مسح البحث"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <nav className="flex gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="تصفية حسب حالة التأمين">
            {INSURANCE_FILTERS.map((item) => (
              <Button
                key={item}
                className="h-9 shrink-0 rounded-full px-4"
                variant={filter === item ? 'default' : 'outline'}
                aria-pressed={filter === item}
                onClick={() => setFilter(item)}
              >
                {item}
              </Button>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-[min(100%-2rem,1120px)] py-6">
        <div className="mb-4 flex items-baseline justify-between gap-3">
          <h2 className="text-base font-bold">قائمة المركبات</h2>
          <p className="text-xs text-muted-foreground" aria-live="polite">
            عرض <strong className="text-foreground">{filteredVehicles.length}</strong> من {VEHICLES.length} مركبة
          </p>
        </div>

        {filteredVehicles.length === 0 ? (
          <section className="flex min-h-[310px] flex-col items-center justify-center px-6 text-center" aria-live="polite">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-muted text-muted-foreground">
              <Search className="h-6 w-6" aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-lg font-bold">لا توجد نتائج</h2>
            <p className="mt-1 text-sm text-muted-foreground">جرّب تغيير كلمات البحث أو حالة التأمين.</p>
            <Button
              className="mt-4 rounded-full"
              variant="outline"
              onClick={() => {
                setQuery('');
                setFilter('الكل');
              }}
            >
              مسح عوامل التصفية
            </Button>
          </section>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredVehicles.map((vehicle) => (
              <PlateCard
                key={vehicle.chassis}
                vehicle={vehicle}
                onSelect={() => setSelectedVehicle(vehicle)}
              />
            ))}
          </div>
        )}

        <footer className="flex items-center justify-center gap-2 py-8 text-xs text-muted-foreground/70">
          <span>بيانات المركبات</span>
          <span aria-hidden="true">·</span>
          <span>التواريخ بالتقويم الهجري</span>
        </footer>
      </main>

      {desktop ? (
        <Dialog open={selectedVehicle !== null} onOpenChange={setOpen}>
          <DialogContent dir="rtl">
            {selectedVehicle && (
              <>
                <DialogHeader className="mb-2 pr-1">
                  <VehicleHeading vehicle={selectedVehicle} />
                </DialogHeader>
                <VehicleDetails vehicle={selectedVehicle} />
              </>
            )}
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={selectedVehicle !== null} onOpenChange={setOpen}>
          <DrawerContent dir="rtl">
            {selectedVehicle && (
              <>
                <DrawerHeader className="px-5 pb-3 pt-5">
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground">
                      <CarFront className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <DrawerTitle className="text-lg font-bold">تفاصيل المركبة</DrawerTitle>
                      <DrawerDescription>
                        {selectedVehicle.plateNumber} {selectedVehicle.arabicLetters.join(' ')}
                      </DrawerDescription>
                    </div>
                  </div>
                </DrawerHeader>
                <div className="overflow-y-auto px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
                  <VehicleDetails vehicle={selectedVehicle} />
                </div>
              </>
            )}
          </DrawerContent>
        </Drawer>
      )}

      <Toaster position="top-center" dir="rtl" richColors closeButton />
    </div>
  );
}
