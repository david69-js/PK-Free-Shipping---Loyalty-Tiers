// extensions/ui-extension/src/LoyaltyShippingSettings.jsx
import "@shopify/ui-extensions/preact";
import {render} from "preact";
import {useState, useMemo} from "preact/hooks";

export default async () => {
  render(<App />, document.body);
};

function App() {
  const {applyMetafieldChange, i18n, data} = shopify;

  const metafieldConfig = useMemo(
    () =>
      parseMetafield(
        data?.metafields?.find(
          metafield => metafield.key === "loyalty-shipping-script",
        )?.value,
      ),
    [data?.metafields],
  );

  const [tiers, setTiers] = useState(metafieldConfig.tiers);

  function onTierChange(index, field, value) {
    setTiers(prev => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        [field]: value,
      };
      return next;
    });
  }

  async function applyExtensionMetafieldChange() {
    await applyMetafieldChange({
      type: "updateMetafield",
      namespace: "$app",
      key: "free-shipping-loyalty-tiers",
      value: JSON.stringify({tiers}),
      valueType: "json",
    });
  }

  return (
    <s-function-settings
      onSubmit={event => {
        event.waitUntil?.(applyExtensionMetafieldChange());
      }}
    >
      <s-heading>{i18n.translate("title")}</s-heading>
      <s-section>
        <s-stack gap="base">
          {tiers.map((tier, index) => (
            <s-stack key={index} gap="base">
              <s-text>
                {i18n.translate("tiers.title", {tier: index + 1})}
              </s-text>

              <s-text-field
               
                name={`tier-${index}-tag`}
                value={tier.customerTag}
                onChange={event =>
                  onTierChange(index, "customerTag", event.currentTarget.value)
                }
              />

              <s-number-field
                label={i18n.translate("tiers.shippingDiscountPercent")}
                name={`tier-${index}-percent`}
                value={String(tier.shippingDiscountPercent)}
                min={0}
                max={100}
                onChange={event =>
                  onTierChange(
                    index,
                    "shippingDiscountPercent",
                    Number(event.currentTarget.value),
                  )
                }
                suffix="%"
              />
            </s-stack>
          ))}
        </s-stack>
      </s-section>
    </s-function-settings>
  );
}

function parseMetafield(value) {
  try {
    const parsed = JSON.parse(value || "{}");
    return {
      tiers:
        parsed.tiers ?? [
          {
            customerTag: "tier: Defender",
            shippingDiscountPercent: 100,
          },
          {
            customerTag: "tier: Advocate",
            shippingDiscountPercent: 100,
          },
          {
            customerTag: "tier: Activist",
            shippingDiscountPercent: 100,
          },
        ],
    };
  } catch {
    return {
      tiers: [
        {
          customerTag: "tier: Defender",
          shippingDiscountPercent: 100,
        },
        {
          customerTag: "tier: Advocate",
          shippingDiscountPercent: 100,
        },
        {
          customerTag: "tier: Activist",
          shippingDiscountPercent: 100,
        },
      ],
    };
  }
}