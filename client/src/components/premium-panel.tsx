import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Crown, Sparkles, Palette, User, MessageSquare, CreditCard, Check, ExternalLink } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface Product {
  id: string;
  name: string;
  description: string;
  prices: Array<{
    id: string;
    unit_amount: number;
    currency: string;
    recurring: { interval: string } | null;
  }>;
}

interface SubscriptionData {
  subscription: any;
  isPremium: boolean;
  customization: {
    customRubiName: string | null;
    customRubiPersonality: string | null;
    customRubiTone: string | null;
    customRubiColor: string | null;
  };
}

export function PremiumPanel() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [customization, setCustomization] = useState({
    customRubiName: "",
    customRubiPersonality: "",
    customRubiTone: "friendly",
    customRubiColor: "#8b5cf6",
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/stripe/products"],
    enabled: isOpen,
    select: (data: any) => data.data || [],
  });

  const { data: subscriptionData, isLoading: loadingSubscription } = useQuery<SubscriptionData>({
    queryKey: ["/api/stripe/subscription"],
    enabled: isOpen,
  });

  // Hydrate customization state from subscriptionData
  useEffect(() => {
    if (subscriptionData?.customization) {
      setCustomization({
        customRubiName: subscriptionData.customization.customRubiName || "",
        customRubiPersonality: subscriptionData.customization.customRubiPersonality || "",
        customRubiTone: subscriptionData.customization.customRubiTone || "friendly",
        customRubiColor: subscriptionData.customization.customRubiColor || "#8b5cf6",
      });
    }
  }, [subscriptionData?.customization]);

  const checkoutMutation = useMutation({
    mutationFn: async (priceId: string) => {
      const res = await apiRequest("POST", "/api/stripe/checkout", { priceId });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to start checkout", variant: "destructive" });
    },
  });

  const portalMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/stripe/portal", {});
      return res.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.open(data.url, "_blank");
      }
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to open portal", variant: "destructive" });
    },
  });

  const updateCustomizationMutation = useMutation({
    mutationFn: async (data: typeof customization) => {
      const res = await apiRequest("PUT", "/api/stripe/customization", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stripe/subscription"] });
      toast({ title: "Saved", description: "Your Rubi customization has been updated" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save customization", variant: "destructive" });
    },
  });

  const handleSaveCustomization = () => {
    updateCustomizationMutation.mutate(customization);
  };

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const isPremium = subscriptionData?.isPremium;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" data-testid="button-premium">
          <Crown className="w-5 h-5 text-yellow-500" />
          {isPremium && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[450px] sm:w-[550px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            Rubi Premium
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-100px)] mt-4">
          <div className="space-y-6 pr-4">
            {isPremium ? (
              <>
                <Card className="border-yellow-500/50 bg-gradient-to-br from-yellow-500/10 to-purple-500/10">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-yellow-500 text-black">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Premium Active
                      </Badge>
                    </div>
                    <CardTitle>Personaliza tu Rubi</CardTitle>
                    <CardDescription>
                      Crea una asistente virtual con personalidad unica
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="custom-name">Nombre personalizado</Label>
                      <Input
                        id="custom-name"
                        placeholder="Ej: Aria, Luna, Nova..."
                        value={customization.customRubiName}
                        onChange={(e) => setCustomization({ ...customization, customRubiName: e.target.value })}
                        data-testid="input-custom-name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="custom-personality">Personalidad</Label>
                      <Textarea
                        id="custom-personality"
                        placeholder="Describe como quieres que sea tu asistente..."
                        value={customization.customRubiPersonality}
                        onChange={(e) => setCustomization({ ...customization, customRubiPersonality: e.target.value })}
                        data-testid="input-custom-personality"
                      />
                    </div>

                    <div>
                      <Label htmlFor="custom-tone">Tono de comunicacion</Label>
                      <Select
                        value={customization.customRubiTone}
                        onValueChange={(value) => setCustomization({ ...customization, customRubiTone: value })}
                      >
                        <SelectTrigger data-testid="select-custom-tone">
                          <SelectValue placeholder="Selecciona un tono" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="friendly">Amigable</SelectItem>
                          <SelectItem value="professional">Profesional</SelectItem>
                          <SelectItem value="playful">Jugueton</SelectItem>
                          <SelectItem value="motivational">Motivador</SelectItem>
                          <SelectItem value="sarcastic">Sarcastico</SelectItem>
                          <SelectItem value="serious">Serio</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="custom-color">Color principal</Label>
                      <div className="flex gap-2">
                        <Input
                          id="custom-color"
                          type="color"
                          value={customization.customRubiColor}
                          onChange={(e) => setCustomization({ ...customization, customRubiColor: e.target.value })}
                          className="w-16 h-10 p-1"
                          data-testid="input-custom-color"
                        />
                        <Input
                          value={customization.customRubiColor}
                          onChange={(e) => setCustomization({ ...customization, customRubiColor: e.target.value })}
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <Button
                      onClick={handleSaveCustomization}
                      disabled={updateCustomizationMutation.isPending}
                      className="w-full"
                      data-testid="button-save-customization"
                    >
                      {updateCustomizationMutation.isPending ? "Guardando..." : "Guardar cambios"}
                    </Button>
                  </CardContent>
                </Card>

                <Separator />

                <div className="space-y-3">
                  <h3 className="font-medium">Gestionar suscripcion</h3>
                  <Button
                    variant="outline"
                    onClick={() => portalMutation.mutate()}
                    disabled={portalMutation.isPending}
                    className="w-full"
                    data-testid="button-manage-subscription"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    {portalMutation.isPending ? "Abriendo..." : "Gestionar pagos"}
                    <ExternalLink className="w-4 h-4 ml-auto" />
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Card className="border-primary/50 bg-gradient-to-br from-purple-500/10 to-pink-500/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      Rubi Premium
                    </CardTitle>
                    <CardDescription>
                      Desbloquea todo el potencial de tu asistente virtual
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span>Nombre personalizado para Rubi</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span>Personalidad y tono a tu gusto</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span>Colores y estilo personalizado</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span>Soporte prioritario</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span>Funciones exclusivas futuras</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">Elige tu plan</h3>
                  
                  {products.length === 0 ? (
                    <Card>
                      <CardContent className="p-6 text-center">
                        <Crown className="w-12 h-12 mx-auto mb-3 text-yellow-500" />
                        <p className="text-lg font-semibold">Rubi Premium</p>
                        <p className="text-2xl font-bold mt-2">9,95 EUR / mes</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Personaliza completamente tu asistente
                        </p>
                        <p className="text-xs text-muted-foreground mt-4">
                          Los planes estaran disponibles pronto
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    products.map((product) => (
                      <Card key={product.id} className="hover-elevate">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h4 className="font-semibold">{product.name}</h4>
                              <p className="text-sm text-muted-foreground">{product.description}</p>
                            </div>
                            <Crown className="w-8 h-8 text-yellow-500" />
                          </div>
                          <div className="space-y-2">
                            {product.prices.map((price) => (
                              <Button
                                key={price.id}
                                onClick={() => checkoutMutation.mutate(price.id)}
                                disabled={checkoutMutation.isPending}
                                className="w-full justify-between"
                                data-testid={`button-subscribe-${price.recurring?.interval || 'one-time'}`}
                              >
                                <span>
                                  {formatPrice(price.unit_amount, price.currency)}
                                  {price.recurring && `/${price.recurring.interval === 'month' ? 'mes' : 'año'}`}
                                </span>
                                <span>Suscribirse</span>
                              </Button>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>

                <div className="text-center text-sm text-muted-foreground">
                  <p>Pago seguro con Stripe</p>
                  <p className="mt-1">Cancela cuando quieras</p>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
