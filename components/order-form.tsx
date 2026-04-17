"use client";

import { useEffect, useMemo, useState } from "react";
import { Gift, Loader2, Search, ShoppingCart, Store, WalletCards } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { clampLoyaltyPayment, getLoyaltyBalance, getMaxLoyaltyPayment } from "@/lib/tablecrm/loyalty";
import { getLineItemTotal, getOrderTotal } from "@/lib/tablecrm/payload";
import type {
  Customer,
  LineItemForm,
  LoyaltyCard,
  Organization,
  Paybox,
  PriceType,
  Product,
  Unit,
  Warehouse
} from "@/lib/tablecrm/schema";
import { formatCurrency, normalizePhone, toNumber } from "@/lib/utils";

interface DictionariesResponse {
  organizations: Organization[];
  payboxes: Paybox[];
  warehouses: Warehouse[];
  priceTypes: PriceType[];
  units: Unit[];
}

const initialDictionaries: DictionariesResponse = {
  organizations: [],
  payboxes: [],
  warehouses: [],
  priceTypes: [],
  units: []
};

const FEEDBACK_TOAST_ID = "tablecrm-feedback";

export function OrderForm() {
  const [tokenInput, setTokenInput] = useState("");
  const [token, setToken] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [comment, setComment] = useState("");
  const [priority, setPriority] = useState(0);

  const [dictionaries, setDictionaries] = useState<DictionariesResponse>(initialDictionaries);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loyaltyCards, setLoyaltyCards] = useState<LoyaltyCard[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [selectedLoyaltyCardId, setSelectedLoyaltyCardId] = useState<number | null>(null);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<number | null>(null);
  const [selectedPayboxId, setSelectedPayboxId] = useState<number | null>(null);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | null>(null);
  const [selectedPriceTypeId, setSelectedPriceTypeId] = useState<number | null>(null);
  const [cart, setCart] = useState<LineItemForm[]>([]);
  const [productQuery, setProductQuery] = useState("");
  const [paidLt, setPaidLt] = useState(0);

  const [loadingDictionaries, setLoadingDictionaries] = useState(false);
  const [searchingCustomers, setSearchingCustomers] = useState(false);
  const [searchingProducts, setSearchingProducts] = useState(false);
  const [submittingMode, setSubmittingMode] = useState<"create" | "conduct" | null>(null);

  function resetConnectedState() {
    setToken("");
    setDictionaries(initialDictionaries);
    setCustomers([]);
    setLoyaltyCards([]);
    setProducts([]);
    setSelectedCustomerId(null);
    setSelectedLoyaltyCardId(null);
    setSelectedOrganizationId(null);
    setSelectedPayboxId(null);
    setSelectedWarehouseId(null);
    setSelectedPriceTypeId(null);
    setCart([]);
    setProductQuery("");
    setComment("");
    setPriority(0);
    setPaidLt(0);
  }

  useEffect(() => {
    const storedToken = window.localStorage.getItem("tablecrm-token");
    if (storedToken) {
      setTokenInput(storedToken);
    }
  }, []);

  function clearFeedback() {
    toast.dismiss(FEEDBACK_TOAST_ID);
  }

  function showError(message: string) {
    toast.error(message, {
      id: FEEDBACK_TOAST_ID,
      duration: 4500
    });
  }

  function showSuccess(message: string) {
    toast.success(message, {
      id: FEEDBACK_TOAST_ID,
      duration: 3500
    });
  }

  const selectedCustomer = useMemo(
    () => customers.find((customer) => customer.id === selectedCustomerId) ?? null,
    [customers, selectedCustomerId]
  );

  const availableLoyaltyCards = useMemo(
    () =>
      loyaltyCards.filter((card) => {
        const matchesCustomer = selectedCustomerId ? card.contragent_id === selectedCustomerId : true;
        const matchesOrganization = selectedOrganizationId ? card.organization_id === selectedOrganizationId : true;
        return matchesCustomer && matchesOrganization;
      }),
    [loyaltyCards, selectedCustomerId, selectedOrganizationId]
  );

  const selectedLoyaltyCard = useMemo(
    () => availableLoyaltyCards.find((card) => card.id === selectedLoyaltyCardId) ?? null,
    [availableLoyaltyCards, selectedLoyaltyCardId]
  );

  const selectedPriceTypeName = useMemo(
    () => dictionaries.priceTypes.find((priceType) => priceType.id === selectedPriceTypeId)?.name ?? "",
    [dictionaries.priceTypes, selectedPriceTypeId]
  );

  const selectedWarehouseName = useMemo(
    () => dictionaries.warehouses.find((warehouse) => warehouse.id === selectedWarehouseId)?.name ?? "",
    [dictionaries.warehouses, selectedWarehouseId]
  );

  const filteredPayboxes = useMemo(() => {
    if (!selectedOrganizationId) {
      return dictionaries.payboxes;
    }

    const organizationPayboxes = dictionaries.payboxes.filter(
      (paybox) => paybox.organization_id === selectedOrganizationId
    );

    return organizationPayboxes.length > 0 ? organizationPayboxes : dictionaries.payboxes;
  }, [dictionaries.payboxes, selectedOrganizationId]);

  const total = useMemo(() => getOrderTotal(cart), [cart]);
  const maxLoyaltyPayment = useMemo(
    () => getMaxLoyaltyPayment(selectedLoyaltyCard, total),
    [selectedLoyaltyCard, total]
  );
  const effectivePaidLt = useMemo(
    () => clampLoyaltyPayment(paidLt, selectedLoyaltyCard, total),
    [paidLt, selectedLoyaltyCard, total]
  );
  const paidRubles = useMemo(() => Math.max(0, Number((total - effectivePaidLt).toFixed(2))), [effectivePaidLt, total]);

  const canSearchProducts = Boolean(token && selectedPriceTypeId);
  const canSubmit =
    Boolean(token) &&
    Boolean(selectedCustomerId) &&
    Boolean(selectedOrganizationId) &&
    Boolean(selectedPayboxId) &&
    Boolean(selectedWarehouseId) &&
    Boolean(selectedPriceTypeId) &&
    cart.length > 0;

  async function handleConnect() {
    if (!tokenInput.trim()) {
      resetConnectedState();
      showError("Введите токен кассы.");
      window.localStorage.removeItem("tablecrm-token");
      return;
    }

    resetConnectedState();
    clearFeedback();
    setLoadingDictionaries(true);

    try {
      const response = await fetch(`/api/tablecrm/dictionaries?token=${encodeURIComponent(tokenInput.trim())}`);
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Не удалось загрузить справочники.");
      }

      const nextDictionaries = payload as DictionariesResponse;
      setDictionaries(nextDictionaries);
      setToken(tokenInput.trim());
      window.localStorage.setItem("tablecrm-token", tokenInput.trim());
      setSelectedOrganizationId(nextDictionaries.organizations[0]?.id ?? null);
      setSelectedWarehouseId(nextDictionaries.warehouses[0]?.id ?? null);
      setSelectedPriceTypeId(nextDictionaries.priceTypes[0]?.id ?? null);
      setSelectedPayboxId(nextDictionaries.payboxes[0]?.id ?? null);
      showSuccess("Касса подключена, справочники загружены.");
    } catch (error) {
      resetConnectedState();
      window.localStorage.removeItem("tablecrm-token");
      showError(error instanceof Error ? error.message : "Не удалось подключить кассу.");
    } finally {
      setLoadingDictionaries(false);
    }
  }

  useEffect(() => {
    if (!selectedPayboxId && filteredPayboxes[0]) {
      setSelectedPayboxId(filteredPayboxes[0].id);
    }

    if (selectedPayboxId && !filteredPayboxes.some((paybox) => paybox.id === selectedPayboxId)) {
      setSelectedPayboxId(filteredPayboxes[0]?.id ?? null);
    }
  }, [filteredPayboxes, selectedPayboxId]);

  useEffect(() => {
    if (availableLoyaltyCards.length === 0) {
      setSelectedLoyaltyCardId(null);
      return;
    }

    if (
      selectedLoyaltyCardId &&
      availableLoyaltyCards.some((loyaltyCard) => loyaltyCard.id === selectedLoyaltyCardId)
    ) {
      return;
    }

    setSelectedLoyaltyCardId(availableLoyaltyCards[0].id);
  }, [availableLoyaltyCards, selectedLoyaltyCardId]);

  useEffect(() => {
    setPaidLt((current) => clampLoyaltyPayment(current, selectedLoyaltyCard, total));
  }, [selectedLoyaltyCard, total]);

  async function handleCustomerSearch() {
    const normalizedPhone = normalizePhone(phoneInput);
    if (!token || !normalizedPhone) {
      showError("Введите телефон клиента в формате +7...");
      return;
    }

    clearFeedback();
    setSearchingCustomers(true);

    try {
      const [customersResponse, loyaltyCardsResponse] = await Promise.all([
        fetch(
          `/api/tablecrm/customers?token=${encodeURIComponent(token)}&phone=${encodeURIComponent(normalizedPhone)}`
        ),
        fetch(
          `/api/tablecrm/loyality-cards?token=${encodeURIComponent(token)}&phone=${encodeURIComponent(normalizedPhone)}`
        )
      ]);
      const [customersPayload, loyaltyCardsPayload] = await Promise.all([
        customersResponse.json(),
        loyaltyCardsResponse.json()
      ]);

      if (!customersResponse.ok) {
        throw new Error(customersPayload.error ?? "Не удалось найти клиента.");
      }

      if (!loyaltyCardsResponse.ok) {
        throw new Error(loyaltyCardsPayload.error ?? "Не удалось загрузить карту лояльности.");
      }

      const nextCustomers = customersPayload.customers as Customer[];
      const nextLoyaltyCards = loyaltyCardsPayload.loyaltyCards as LoyaltyCard[];
      setCustomers(nextCustomers);
      setLoyaltyCards(nextLoyaltyCards);
      setSelectedCustomerId(nextCustomers[0]?.id ?? null);
      setPaidLt(0);
      if (nextCustomers.length === 0) {
        showSuccess("Клиенты по этому номеру не найдены.");
      } else if (nextLoyaltyCards.length > 0) {
        showSuccess("Клиент и карты лояльности загружены.");
      } else {
        showSuccess("Клиент найден. Карта лояльности не найдена.");
      }
    } catch (error) {
      showError(error instanceof Error ? error.message : "Не удалось найти клиента.");
    } finally {
      setSearchingCustomers(false);
    }
  }

  useEffect(() => {
    if (!token) {
      setProducts([]);
      setSearchingProducts(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setSearchingProducts(true);

      try {
        const query = new URLSearchParams({ token });

        if (productQuery.trim()) {
          query.set("q", productQuery.trim());
        }

        const response = await fetch(`/api/tablecrm/products?${query.toString()}`, {
          signal: controller.signal
        });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error ?? "Не удалось загрузить товары.");
        }

        setProducts(payload.products as Product[]);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        showError(error instanceof Error ? error.message : "Не удалось загрузить товары.");
      } finally {
        if (!controller.signal.aborted) {
          setSearchingProducts(false);
        }
      }
    }, 300);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [productQuery, token]);

  function resolveProductPrice(product: Product) {
    const price = product.prices.find(
      (entry) =>
        entry.price_type === selectedPriceTypeId ||
        entry.price_type_id === selectedPriceTypeId ||
        entry.price_type === selectedPriceTypeName
    );
    return typeof price?.price === "number" && price.price > 0 ? price.price : null;
  }

  function resolveUnitName(product: Product) {
    if (product.unit_name) {
      return product.unit_name;
    }
    return dictionaries.units.find((unit) => unit.id === product.unit)?.symbol_national_view ?? "";
  }

  function handleAddProduct(product: Product) {
    const resolvedPrice = resolveProductPrice(product);
    const price = resolvedPrice ?? 0;

    setCart((current) => {
      const existingIndex = current.findIndex((item) => item.productId === product.id);

      if (existingIndex >= 0) {
        return current.map((item, index) =>
          index === existingIndex ? { ...item, quantity: item.quantity + 1 } : item
        );
      }

      return [
        ...current,
        {
          productId: product.id,
          productName: product.name,
          quantity: 1,
          price,
          unitId: product.unit ?? undefined,
          unitName: resolveUnitName(product),
          discount: 0
        }
      ];
    });

    showSuccess(`Товар добавлен: ${product.name}`);
  }

  function handleCartChange(productId: number, field: keyof LineItemForm, value: string) {
    setCart((current) =>
      current.map((item) => {
        if (item.productId !== productId) {
          return item;
        }

        if (field === "productName" || field === "unitName") {
          return { ...item, [field]: value };
        }

        const nextValue = Math.max(0, toNumber(value));

        if (field === "quantity") {
          return {
            ...item,
            quantity: Math.max(1, nextValue)
          };
        }

        return {
          ...item,
          [field]: nextValue
        };
      })
    );
  }

  function handleRemoveCartItem(productId: number) {
    setCart((current) => current.filter((item) => item.productId !== productId));
  }

  async function handleSubmit(mode: "create" | "conduct") {
    if (!canSubmit) {
      showError("Заполните клиента, параметры продажи и добавьте хотя бы один товар.");
      return;
    }

    clearFeedback();
    setSubmittingMode(mode);

    try {
      const response = await fetch("/api/tablecrm/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          mode,
          contragent: selectedCustomerId,
          organization: selectedOrganizationId,
          paybox: selectedPayboxId,
          warehouse: selectedWarehouseId,
          priceType: selectedPriceTypeId,
          loyalityCardId: selectedLoyaltyCard?.id ?? undefined,
          paidRubles,
          paidLt: effectivePaidLt,
          comment,
          priority,
          items: cart
        })
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Не удалось создать продажу.");
      }

      const createdId =
        Array.isArray(payload.result) && payload.result.length > 0 && typeof payload.result[0]?.id === "number"
          ? payload.result[0].id
          : undefined;

      showSuccess(
        createdId
          ? `Продажа создана успешно. ID: ${createdId}.`
          : "Продажа отправлена в TableCRM успешно."
      );
      setProducts([]);
      setProductQuery("");
      setCart([]);
      setComment("");
      setPaidLt(0);
    } catch (error) {
      showError(error instanceof Error ? error.message : "Не удалось создать продажу.");
    } finally {
      setSubmittingMode(null);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-10 pt-5 sm:max-w-2xl sm:px-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Badge variant="outline">tablecrm.com</Badge>
          <h1 className="text-3xl font-semibold tracking-tight text-balance">Мобильный заказ</h1>
          <p className="max-w-sm text-sm leading-6 text-[color:var(--muted-foreground)]">
            WebApp для создания продажи и проведения в один клик.
          </p>
        </div>
        <Card className="shrink-0 rounded-2xl px-3 py-2">
          <div className="text-right">
            <div className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
              Статус
            </div>
            <div className="text-sm font-semibold">{token ? "Касса подключена" : "Касса не подключена"}</div>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>1. Подключение кассы</CardTitle>
            <CardDescription>Введите токен и загрузите справочники</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="token">Token</Label>
              <Input
                id="token"
                onChange={(event) => setTokenInput(event.target.value)}
                placeholder="Введите token кассы"
                value={tokenInput}
              />
            </div>
            <Button className="w-full" disabled={loadingDictionaries} onClick={handleConnect}>
              {loadingDictionaries ? <Loader2 className="size-4 animate-spin" /> : <Store className="size-4" />}
              Подключить
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Клиент</CardTitle>
            <CardDescription>Поиск клиента по телефону</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="phone">Телефон</Label>
              <div className="flex gap-2">
                <Input
                  disabled={!token}
                  id="phone"
                  inputMode="tel"
                  onChange={(event) => setPhoneInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      void handleCustomerSearch();
                    }
                  }}
                  placeholder="+79990000000"
                  value={phoneInput}
                />
                <Button
                  className="h-11 w-11 shrink-0 rounded-2xl [&_svg]:size-5"
                  disabled={!token || searchingCustomers}
                  onClick={handleCustomerSearch}
                  size="icon"
                >
                  {searchingCustomers ? (
                    <Loader2 className="size-5 animate-spin" />
                  ) : (
                    <Search className="size-5" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer">Найденный клиент</Label>
              <Select
                disabled={!token || customers.length === 0}
                id="customer"
                onChange={(event) => setSelectedCustomerId(Number(event.target.value))}
                options={customers.map((customer) => ({
                  label: `${customer.name}${customer.phone ? ` · ${customer.phone}` : ""}`,
                  value: String(customer.id)
                }))}
                placeholder="Клиент не выбран"
                value={selectedCustomerId ? String(selectedCustomerId) : ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="loyaltyCard">Карта лояльности</Label>
              <Select
                disabled={!selectedCustomer || availableLoyaltyCards.length === 0}
                id="loyaltyCard"
                onChange={(event) => setSelectedLoyaltyCardId(Number(event.target.value))}
                options={availableLoyaltyCards.map((card) => ({
                  label: `#${card.card_number || card.id}`,
                  value: String(card.id)
                }))}
                placeholder="Карта не найдена"
                value={selectedLoyaltyCardId ? String(selectedLoyaltyCardId) : ""}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 rounded-2xl bg-[color:var(--muted)]/35 p-3 text-sm">
              <div>
                <div className="text-[color:var(--muted-foreground)]">Остаток лояльности</div>
                <div className="mt-1 font-semibold">{getLoyaltyBalance(selectedLoyaltyCard).toFixed(2)}</div>
              </div>
              <div>
                <div className="text-[color:var(--muted-foreground)]">Макс. списание</div>
                <div className="mt-1 font-semibold">{maxLoyaltyPayment.toFixed(2)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. Параметры продажи</CardTitle>
            <CardDescription>Счёт, организация, склад и тип цены</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="space-y-2">
              <Label htmlFor="organization">Организация</Label>
              <Select
                disabled={!token}
                id="organization"
                onChange={(event) => setSelectedOrganizationId(Number(event.target.value))}
                options={dictionaries.organizations.map((organization) => ({
                  label: organization.short_name,
                  value: String(organization.id)
                }))}
                placeholder="Выберите организацию"
                value={selectedOrganizationId ? String(selectedOrganizationId) : ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paybox">Счёт</Label>
              <Select
                disabled={!token}
                id="paybox"
                onChange={(event) => setSelectedPayboxId(Number(event.target.value))}
                options={filteredPayboxes.map((paybox) => ({
                  label: paybox.name,
                  value: String(paybox.id)
                }))}
                placeholder="Выберите счёт"
                value={selectedPayboxId ? String(selectedPayboxId) : ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="warehouse">Склад</Label>
              <Select
                disabled={!token}
                id="warehouse"
                onChange={(event) => setSelectedWarehouseId(Number(event.target.value))}
                options={dictionaries.warehouses.map((warehouse) => ({
                  label: warehouse.name,
                  value: String(warehouse.id)
                }))}
                placeholder="Выберите склад"
                value={selectedWarehouseId ? String(selectedWarehouseId) : ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priceType">Тип цены</Label>
              <Select
                disabled={!token}
                id="priceType"
                onChange={(event) => setSelectedPriceTypeId(Number(event.target.value))}
                options={dictionaries.priceTypes.map((priceType) => ({
                  label: priceType.name,
                  value: String(priceType.id)
                }))}
                placeholder="Выберите тип цены"
                value={selectedPriceTypeId ? String(selectedPriceTypeId) : ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Приоритет</Label>
              <Input
                id="priority"
                inputMode="numeric"
                max={10}
                min={0}
                onChange={(event) => setPriority(Math.min(10, Math.max(0, toNumber(event.target.value))))}
                type="number"
                value={String(priority)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. Товары</CardTitle>
            <CardDescription>Список товаров с фильтром по названию</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Input
                disabled={!canSearchProducts}
                onChange={(event) => setProductQuery(event.target.value)}
                placeholder="Фильтр товаров по названию"
                value={productQuery}
              />
            </div>

            <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
              {searchingProducts ? (
                <div className="flex items-center gap-2 text-sm text-[color:var(--muted-foreground)]">
                  <Loader2 className="size-4 animate-spin" />
                  Загрузка товаров...
                </div>
              ) : null}

              {!canSearchProducts ? (
                <p className="text-sm text-[color:var(--muted-foreground)]">
                  Подключите кассу и выберите тип цены, чтобы загрузить товары.
                </p>
              ) : products.length === 0 ? (
                <p className="text-sm text-[color:var(--muted-foreground)]">Товары не найдены</p>
              ) : (
                products.map((product) => {
                  const balance = product.balances.find(
                    (item) =>
                      item.warehouse === selectedWarehouseId ||
                      item.warehouse_id === selectedWarehouseId ||
                      item.warehouse_name === selectedWarehouseName
                  );
                  const resolvedPrice = resolveProductPrice(product);

                  return (
                    <div
                      className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--background)] p-3"
                      key={product.id}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="mt-1 text-xs text-[color:var(--muted-foreground)]">
                            Цена:{" "}
                            {resolvedPrice === null
                              ? "не задана для выбранного типа"
                              : formatCurrency(resolvedPrice)}
                            {balance?.quantity !== undefined ? ` · Остаток: ${balance.quantity}` : ""}
                          </div>
                        </div>
                        <Button onClick={() => handleAddProduct(product)} size="sm" variant="outline">
                          Добавить
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Корзина</CardTitle>
                <CardDescription>Количество, цена и сумма по позициям</CardDescription>
              </div>
              <ShoppingCart className="size-5 text-[color:var(--muted-foreground)]" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {cart.length === 0 ? (
              <p className="text-sm text-[color:var(--muted-foreground)]">Добавьте хотя бы один товар</p>
            ) : (
              cart.map((item) => (
                <div className="space-y-3 rounded-2xl border border-[color:var(--border)] p-3" key={item.productId}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">{item.productName}</div>
                      <div className="text-xs text-[color:var(--muted-foreground)]">
                        {item.unitName || "Единица не указана"}
                      </div>
                    </div>
                    <Button onClick={() => handleRemoveCartItem(item.productId)} size="sm" variant="ghost">
                      Удалить
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor={`qty-${item.productId}`}>Количество</Label>
                      <Input
                        id={`qty-${item.productId}`}
                        inputMode="decimal"
                        min={0}
                        onChange={(event) => handleCartChange(item.productId, "quantity", event.target.value)}
                        type="number"
                        value={String(item.quantity)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`price-${item.productId}`}>Цена</Label>
                      <Input
                        id={`price-${item.productId}`}
                        inputMode="decimal"
                        min={0}
                        onChange={(event) => handleCartChange(item.productId, "price", event.target.value)}
                        type="number"
                        value={String(item.price)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`discount-${item.productId}`}>Скидка</Label>
                      <Input
                        id={`discount-${item.productId}`}
                        inputMode="decimal"
                        min={0}
                        onChange={(event) => handleCartChange(item.productId, "discount", event.target.value)}
                        type="number"
                        value={String(item.discount)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Итого</Label>
                      <Input disabled value={formatCurrency(getLineItemTotal(item))} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Оплата</CardTitle>
                <CardDescription>Разделите сумму между баллами и рублями</CardDescription>
              </div>
              <Gift className="size-5 text-[color:var(--muted-foreground)]" />
            </div>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="space-y-2">
              <Label htmlFor="paidLt">Баллами</Label>
              <Input
                disabled={!selectedLoyaltyCard || maxLoyaltyPayment <= 0}
                id="paidLt"
                inputMode="decimal"
                max={maxLoyaltyPayment}
                min={0}
                onChange={(event) => setPaidLt(toNumber(event.target.value))}
                type="number"
                value={String(effectivePaidLt)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paidRubles">Рублями</Label>
              <Input disabled id="paidRubles" value={formatCurrency(paidRubles)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Комментарий</CardTitle>
            <CardDescription>Дополнительная информация к заказу</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              onChange={(event) => setComment(event.target.value)}
              placeholder="Комментарий к заказу (необязательно)"
              value={comment}
            />
          </CardContent>
        </Card>

        <Card className="rounded-[28px] shadow-[0_18px_60px_-32px_rgba(12,18,32,0.25)]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">Итого</p>
                <p className="font-mono text-2xl font-semibold">{formatCurrency(total)}</p>
              </div>
              <Badge variant={selectedCustomer ? "success" : "warning"}>
                {selectedCustomer ? "Клиент выбран" : "Нужен клиент"}
              </Badge>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
              <div className="rounded-2xl bg-[color:var(--muted)]/35 p-3">
                <div className="text-[color:var(--muted-foreground)]">Лояльность</div>
                <div className="mt-1 font-semibold">{effectivePaidLt.toFixed(2)}</div>
              </div>
              <div className="rounded-2xl bg-[color:var(--muted)]/35 p-3">
                <div className="text-[color:var(--muted-foreground)]">Рублями</div>
                <div className="mt-1 font-semibold">{paidRubles.toFixed(2)}</div>
              </div>
              <div className="rounded-2xl bg-[color:var(--muted)]/35 p-3">
                <div className="text-[color:var(--muted-foreground)]">Карта</div>
                <div className="mt-1 font-semibold">{selectedLoyaltyCard ? "Да" : "Нет"}</div>
              </div>
            </div>
            <Separator />
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <Button
                className="w-full"
                disabled={!canSubmit || submittingMode !== null}
                onClick={() => void handleSubmit("create")}
                variant="outline"
              >
                {submittingMode === "create" ? <Loader2 className="size-4 animate-spin" /> : <WalletCards className="size-4" />}
                Создать продажу
              </Button>
              <Button
                className="w-full"
                disabled={!canSubmit || submittingMode !== null}
                onClick={() => void handleSubmit("conduct")}
              >
                {submittingMode === "conduct" ? <Loader2 className="size-4 animate-spin" /> : <WalletCards className="size-4" />}
                Создать и провести
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
