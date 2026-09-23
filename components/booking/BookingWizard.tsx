"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Stepper } from "@/components/booking/Stepper";
import { ServiceStep } from "@/components/booking/ServiceStep";
import { DateStep } from "@/components/booking/DateStep";
import { TimeStep } from "@/components/booking/TimeStep";
import { CustomerStep } from "@/components/booking/CustomerStep";
import { SummaryStep } from "@/components/booking/SummaryStep";
import { Button } from "@/components/ui/Button";
import { createAppointment, BookingError } from "@/lib/booking/api";
import { saveBookingConfirmation } from "@/lib/booking/confirmationStorage";
import type { Service, AvailableSlot } from "@/lib/types/database";
import type { CustomerData } from "@/lib/validation/booking";

interface BookingWizardProps {
  services: Service[];
}

type Step = 1 | 2 | 3 | 4 | 5;

export function BookingWizard({ services }: BookingWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);

  const [service, setService] = useState<Service | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [slot, setSlot] = useState<AvailableSlot | null>(null);
  const [customer, setCustomer] = useState<CustomerData | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function goBack() {
    setSubmitError(null);
    setStep((s) => (s > 1 ? ((s - 1) as Step) : s));
  }

  function selectService(selected: Service) {
    setService(selected);
    setDate(null);
    setSlot(null);
    setStep(2);
  }

  function selectDate(iso: string) {
    setDate(iso);
    setSlot(null);
    setStep(3);
  }

  function selectSlot(selected: AvailableSlot) {
    setSlot(selected);
    setStep(4);
  }

  function submitCustomer(data: CustomerData) {
    setCustomer(data);
    setStep(5);
  }

  async function confirmBooking() {
    if (!service || !date || !slot || !customer) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      await createAppointment({
        serviceId: service.id,
        date,
        startTime: slot.slot_start,
        customer,
      });

      saveBookingConfirmation({
        serviceName: service.name,
        date,
        time: slot.slot_start,
        customerName: customer.name,
      });

      router.push("/reservar/confirmada");
    } catch (error) {
      if (error instanceof BookingError) {
        setSubmitError(error.message);
        if (error.code === "SLOT_NOT_AVAILABLE") {
          setSlot(null);
          setStep(3);
        }
      } else {
        setSubmitError("No se ha podido completar la solicitud. Inténtalo de nuevo.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  const canContinueFromCustomer = step === 4;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 px-5 py-10 sm:px-8 sm:py-14">
      <Stepper current={step} />

      <div className="min-h-[320px]">
        {step === 1 && (
          <ServiceStep services={services} selectedId={service?.id ?? null} onSelect={selectService} />
        )}

        {step === 2 && service && (
          <DateStep selectedDate={date} onSelect={selectDate} />
        )}

        {step === 3 && service && date && (
          <TimeStep
            key={`${service.id}-${date}`}
            serviceId={service.id}
            date={date}
            selectedTime={slot?.slot_start ?? null}
            onSelect={selectSlot}
          />
        )}

        {step === 4 && (
          <CustomerStep defaultValues={customer ?? {}} onSubmit={submitCustomer} />
        )}

        {step === 5 && service && date && slot && customer && (
          <SummaryStep
            service={service}
            date={date}
            time={slot.slot_start}
            customer={customer}
            error={submitError}
          />
        )}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-cream/10 pt-6">
        <Button
          type="button"
          variant="ghost"
          onClick={goBack}
          disabled={step === 1 || submitting}
        >
          Atrás
        </Button>

        {canContinueFromCustomer ? (
          <Button type="submit" form="customer-form">
            Continuar
          </Button>
        ) : step === 5 ? (
          <Button type="button" onClick={confirmBooking} disabled={submitting}>
            {submitting ? "Enviando…" : "Confirmar solicitud"}
          </Button>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}
