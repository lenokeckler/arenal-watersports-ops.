import { MONEY_NUMBERS } from "@/app/constants";

/**
 * Todos los usuarios de este sistema son costarricenses, asi que los montos
 * se escriben como se escriben aqui: punto para los miles y coma para los
 * decimales.
 *
 * El motivo no es cosmetico. Antes cada pantalla hacia `toFixed(2)` a secas,
 * y en colones —donde un cobro corriente va en decenas o cientos de miles—
 * eso imprime `100000.00` y `1000000.00`, que de reojo son casi el mismo
 * numero. Es dinero, y se lee de pie en un muelle.
 *
 * Los decimales se conservan siempre, incluso en colones: la base guarda
 * `numeric(14,2)` y esconder un decimal seria perder plata de verdad.
 */
const MONEY_LOCALE = "es-CR";

const moneyFormatter = new Intl.NumberFormat(MONEY_LOCALE, {
  maximumFractionDigits: MONEY_NUMBERS.AMOUNT_DECIMALS,
  minimumFractionDigits: MONEY_NUMBERS.AMOUNT_DECIMALS,
});

/** El monto sin simbolo: quien llama ya pinta la moneda por su lado. */
export const formatAmount = (value: number): string =>
  moneyFormatter.format(value);
