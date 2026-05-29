"use client";

import React, { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  HelpCircle, 
  Mail, 
  Wallet, 
  CheckCircle2, 
  Verified, 
  ArrowRight, 
  Headphones,
  ShieldCheck
} from "lucide-react";

import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@repo/ui/components/select";
import { RadioGroup, RadioGroupItem } from "@repo/ui/components/radio-group";
import { Card, CardContent } from "@repo/ui/components/card";
import { Label } from "@repo/ui/components/label";
import { Separator } from "@repo/ui/components/separator";
import { checkout as createCheckout, getCart } from "@/actions/ecommerce";
import type { Cart } from "@/lib/ecommerce-types";

export default function CheckoutPage() {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState("telebirr");
  const [billingAddress, setBillingAddress] = useState("");
  const [city, setCity] = useState("Addis Ababa");
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let active = true;

    async function loadCart() {
      setLoading(true);
      setError(null);

      try {
        const response = await getCart();
        if (!active) {
          return;
        }

        setCart(response);
      } catch {
        if (active) {
          setError("Unable to load checkout cart.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadCart();

    return () => {
      active = false;
    };
  }, []);

  const selectedItem = cart?.items?.[0] ?? null;
  const subtotal = selectedItem ? selectedItem.unit_price * selectedItem.quantity : 0;
  const processingFee = 0;
  const total = subtotal + processingFee;

  const submitOrder = () => {
    if (!selectedItem) {
      setError("Your cart is empty.");
      return;
    }

    setError(null);
    setSuccess(null);
    startTransition(async () => {
      try {
        const response = await createCheckout({
          vendor_id: selectedItem.vendor_id,
          listing_id: selectedItem.listing_id,
          quantity: selectedItem.quantity,
          delivery_address: billingAddress || city,
          payment_method: paymentMethod as "chapa" | "telebirr" | "cash",
        });

        setSuccess("Purchase created successfully.");
        if (response.payment_url) {
          sessionStorage.setItem(
            "pending_checkout",
            JSON.stringify({
              listingIds: [selectedItem.listing_id],
              references: [response.reference],
            }),
          );
          sessionStorage.removeItem("pending_checkout_listings");
          window.location.assign(response.payment_url);
          return;
        }

        router.push(`/orders/${response.id}`);
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : "Unable to complete checkout.");
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background antialiased p-8">
        <p className="text-sm text-muted-foreground">Loading checkout...</p>
      </div>
    );
  }

  if (error && !selectedItem) {
    return (
      <div className="min-h-screen bg-background antialiased p-8">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">

      {/* Focused Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="flex justify-between items-center h-16 px-4 md:px-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="rounded-lg">
                <ArrowLeft className="h-5 w-5 text-muted-foreground" />
              </Button>
            </Link>
            <span className="text-lg font-bold">SpendSense</span>
          </div>

          {/* Stepper - Hidden on small mobile */}
          <div className="hidden sm:flex items-center gap-4 md:gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">1</div>
              <span className="text-sm font-semibold text-primary">Information</span>
            </div>
            <div className="w-8 h-px bg-border"></div>
            <div className="flex items-center gap-2 opacity-40">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xs font-bold">2</div>
              <span className="text-sm font-semibold">Payment</span>
            </div>
          </div>

          <Button variant="ghost" size="icon">
            <HelpCircle className="h-5 w-5 text-muted-foreground" />
          </Button>
        </div>
      </header>

      <main className="pt-24 pb-24 md:pb-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {error && <p className="mb-6 text-sm text-destructive">{error}</p>}
          {success && <p className="mb-6 text-sm text-emerald-600">{success}</p>}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Left Column: Form */}
            <div className="lg:col-span-8 space-y-8">
              <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Checkout</h1>
                <p className="text-muted-foreground">Complete your purchase to start managing your finances with precision.</p>
              </div>

              {/* Billing Section */}
              <Card className="border-none shadow-sm bg-card">
                <CardContent className="p-6 md:p-8 space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Mail className="text-primary h-5 w-5" />
                    </div>
                    <h2 className="text-xl font-bold">Billing Information</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">First Name</Label>
                      <Input className="bg-secondary/50 border-none h-12" placeholder="e.g. Dawit" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Last Name</Label>
                      <Input className="bg-secondary/50 border-none h-12" placeholder="e.g. Bekele" />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address</Label>
                      <Input className="bg-secondary/50 border-none h-12" type="email" placeholder="dawit.bekele@email.com" />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Billing Address</Label>
                      <Input className="bg-secondary/50 border-none h-12" placeholder="Bole Sub-city, Woreda 03" value={billingAddress} onChange={(event) => setBillingAddress(event.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">City</Label>
                      <Input className="bg-secondary/50 border-none h-12" value={city} onChange={(event) => setCity(event.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Country</Label>
                      <Select defaultValue="ethiopia">
                        <SelectTrigger className="bg-secondary/50 border-none h-12">
                          <SelectValue placeholder="Select Country" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ethiopia">Ethiopia</SelectItem>
                          <SelectItem value="kenya">Kenya</SelectItem>
                          <SelectItem value="usa">USA</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Methods Section */}
              <Card className="border-none shadow-sm bg-card">
                <CardContent className="p-6 md:p-8 space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Wallet className="text-primary h-5 w-5" />
                    </div>
                    <h2 className="text-xl font-bold">Payment Method</h2>
                  </div>

                  <RadioGroup 
                    defaultValue="telebirr" 
                    onValueChange={setPaymentMethod}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    {/* Telebirr */}
                    <Label
                      htmlFor="telebirr"
                      className={`relative flex flex-col p-6 rounded-xl border-2 cursor-pointer transition-all ${
                        paymentMethod === "telebirr" ? "border-primary bg-primary/5" : "border-border bg-secondary/30"
                      }`}
                    >
                      <RadioGroupItem value="telebirr" id="telebirr" className="sr-only" />
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-lg bg-white p-1 flex items-center justify-center shadow-sm overflow-hidden">
                          <Image src="/api/placeholder/48/48" alt="Telebirr" width={48} height={48} />
                        </div>
                        {paymentMethod === "telebirr" && <CheckCircle2 className="text-primary h-6 w-6" fill="currentColor" />}
                      </div>
                      <h3 className="font-bold">Telebirr</h3>
                      <p className="text-xs text-muted-foreground mt-1">Instant mobile wallet transfer</p>
                    </Label>

                    {/* Chapa */}
                    <Label
                      htmlFor="chapa"
                      className={`relative flex flex-col p-6 rounded-xl border-2 cursor-pointer transition-all ${
                        paymentMethod === "chapa" ? "border-primary bg-primary/5" : "border-border bg-secondary/30"
                      }`}
                    >
                      <RadioGroupItem value="chapa" id="chapa" className="sr-only" />
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-lg bg-white p-1 flex items-center justify-center shadow-sm overflow-hidden">
                          <Image src="/api/placeholder/48/48" alt="Chapa" width={48} height={48} />
                        </div>
                        {paymentMethod === "chapa" && <CheckCircle2 className="text-primary h-6 w-6" fill="currentColor" />}
                      </div>
                      <h3 className="font-bold">Chapa</h3>
                      <p className="text-xs text-muted-foreground mt-1">Local cards and bank transfers</p>
                    </Label>
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-4">
              <div className="sticky top-24 space-y-6">
                <Card className="border-none shadow-sm overflow-hidden">
                  <div className="bg-primary px-6 py-8 text-primary-foreground relative overflow-hidden">
                    <div className="relative z-10">
                          <h2 className="text-lg font-bold opacity-90 mb-1">{selectedItem?.item_name ?? "Cart Summary"}</h2>
                      <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-extrabold tracking-tight">ETB {total.toFixed(2)}</span>
                            <span className="text-sm opacity-75">/checkout</span>
                      </div>
                    </div>
                    {/* Decorative SVG */}
                    <svg className="absolute inset-0 h-full w-full opacity-10 pointer-events-none" preserveAspectRatio="none" viewBox="0 0 100 100">
                      <path d="M0 100 C 20 0, 50 0, 100 100 Z" fill="white"></path>
                    </svg>
                  </div>

                  <CardContent className="p-6 space-y-6">
                    <div className="space-y-4">
                      <SummaryItem label="Listing" value={selectedItem ? selectedItem.item_name : "Unavailable"} />
                      <SummaryItem label="Subtotal" value={`ETB ${subtotal.toFixed(2)}`} />
                      <SummaryItem label="Processing Fee" value={`ETB ${processingFee.toFixed(2)}`} />
                      <Separator className="bg-border/50" />
                      <div className="flex justify-between items-center">
                        <span className="text-base font-bold">Total Due</span>
                        <span className="text-xl font-extrabold text-primary">ETB {total.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <TrustLine icon={<ShieldCheck size={14} className="text-green-500" />} text="Secure 256-bit SSL encryption" />
                      <TrustLine icon={<Verified size={14} className="text-green-500" />} text="14-day money-back guarantee" />
                    </div>

                    <Button className="w-full h-14 rounded-xl font-bold text-lg gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all" onClick={submitOrder} disabled={isPending || !selectedItem}>
                      Complete Payment
                      <ArrowRight size={20} />
                    </Button>

                    <p className="text-[10px] text-center text-muted-foreground px-4 leading-relaxed">
                      By completing your purchase, you agree to SpendSense's{" "}
                      <Link href="#" className="underline">Terms of Service</Link> and{" "}
                      <Link href="#" className="underline">Privacy Policy</Link>.
                    </p>
                  </CardContent>
                </Card>

                {/* Promo Code Card */}
                {/* <Card className="bg-secondary/30 border-none p-6 rounded-xl">
                  <h3 className="text-sm font-bold mb-4">Have a promo code?</h3>
                  <div className="flex gap-2">
                    <Input className="bg-background border-border" placeholder="Enter code" />
                    <Button variant="secondary" className="font-bold">Apply</Button>
                  </div>
                </Card> */}

                {/* Support Widget */}
                <div className="flex items-center gap-4 px-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Headphones size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">Need help?</h4>
                    <p className="text-xs text-muted-foreground">Our concierge is available 24/7</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Sticky Footer */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background p-4 border-t z-50">
        <Button className="w-full h-14 font-bold text-lg rounded-xl gap-2" onClick={submitOrder} disabled={isPending || !selectedItem}>
          Pay ETB {total.toFixed(2)}
          <ArrowRight size={20} />
        </Button>
      </div>
    </div>
  );
}

// Helpers
function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}

function TrustLine({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex gap-3 text-xs text-muted-foreground items-center">
      {icon}
      <span>{text}</span>
    </div>
  );
}
