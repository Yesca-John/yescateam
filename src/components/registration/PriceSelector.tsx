// Price Selector Component - Variable pricing for registrations
"use client";

import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { RegistrationType } from "@/lib/registration/types";

interface PriceSelectorProps {
  registrationType: RegistrationType;
  value: number;
  onChange: (value: number) => void;
}

const PRICE_CONFIG = {
  normal: {
    min: 300,
    midPoint: 10000,  // 75% of slider = ₹10,000
    midPercent: 75,   // Position of midPoint on slider
    max: 100000,
    default: 300,
    stepLow: 25,      // Step size for amounts below midPoint
    stepHigh: 1000,   // Step size for amounts above midPoint
    label: "Registration Amount",
    labelTe: "",
    description: "Minimum ₹300, You can contribute more if you wish",
    descriptionTe: "కనీసం ₹300, మీరు కావాలనుకుంటే మరింత సహకరించవచ్చు. ",
    quickAmounts: [300, 500, 1000, 2000, 5000, 10000],
  },
  faithbox: {
    min: 50,
    midPoint: 10000,
    midPercent: 75,
    max: 100000,
    default: 50,
    stepLow: 25,
    stepHigh: 1000,
    label: "Faithbox Registration Amount",
    labelTe: "ఫెయిత్ బాక్స్ రిజిస్ట్రేషన్ మొత్తం",
    description: "Minimum ₹50, You can contribute more if you wish",
    descriptionTe: "కనీసం ₹50, మీరు కావాలనుకుంటే మరింత సహకరించవచ్చు",
    quickAmounts: [50, 100, 200, 500, 1000, 2000],
  },
  kids: {
    min: 100,
    midPoint: 10000,
    midPercent: 75,
    max: 100000,
    default: 100,
    stepLow: 25,
    stepHigh: 1000,
    label: "Kids Registration Amount",
    labelTe: "పిల్లల రిజిస్ట్రేషన్ మొత్తం",
    description: "Minimum ₹100, You can contribute more if you wish",
    descriptionTe: "కనీసం ₹100, మీరు కావాలనుకుంటే మరింత సహకరించవచ్చు",
    quickAmounts: [100, 200, 500, 1000, 2000, 5000],
  },
};

export function PriceSelector({ registrationType, value, onChange }: PriceSelectorProps) {
  const config = PRICE_CONFIG[registrationType];
  const [inputValue, setInputValue] = useState(value.toString());

  // Convert actual price to slider position (0-100)
  // First 75% (0-75) maps to min-midPoint
  // Last 25% (75-100) maps to midPoint-max
  const priceToSlider = useCallback((price: number): number => {
    const midPercent = config.midPercent;
    if (price <= config.midPoint) {
      // First part: linear mapping from min to midPoint -> 0 to midPercent
      return ((price - config.min) / (config.midPoint - config.min)) * midPercent;
    } else {
      // Second part: linear mapping from midPoint to max -> midPercent to 100
      return midPercent + ((price - config.midPoint) / (config.max - config.midPoint)) * (100 - midPercent);
    }
  }, [config]);

  // Convert slider position (0-100) to actual price
  const sliderToPrice = useCallback((sliderValue: number): number => {
    const midPercent = config.midPercent;
    if (sliderValue <= midPercent) {
      // First part: 0-midPercent -> min to midPoint
      const price = config.min + (sliderValue / midPercent) * (config.midPoint - config.min);
      return Math.round(price / config.stepLow) * config.stepLow; // Round to stepLow
    } else {
      // Second part: midPercent-100 -> midPoint to max
      const price = config.midPoint + ((sliderValue - midPercent) / (100 - midPercent)) * (config.max - config.midPoint);
      return Math.round(price / config.stepHigh) * config.stepHigh; // Round to stepHigh for larger amounts
    }
  }, [config]);

  const handleSliderChange = (values: number[]) => {
    const newPrice = sliderToPrice(values[0]);
    onChange(newPrice);
    setInputValue(newPrice.toString());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // Only update parent if valid number
    const numValue = parseInt(newValue);
    if (!isNaN(numValue) && numValue >= config.min && numValue <= config.max) {
      onChange(numValue);
    }
  };

  const handleInputBlur = () => {
    // Validate and correct on blur
    let numValue = parseInt(inputValue);
    if (isNaN(numValue) || numValue < config.min) {
      numValue = config.min;
    } else if (numValue > config.max) {
      numValue = config.max;
    }
    onChange(numValue);
    setInputValue(numValue.toString());
  };

  const handleQuickAmountClick = (amount: number) => {
    onChange(amount);
    setInputValue(amount.toString());
  };

  return (
    <Card className="p-6 mb-6 shadow-lg border-0 bg-primary/5">
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-1">
            {config.label}
          </h3>
          <p className="text-sm text-muted-foreground mb-1">
            {config.labelTe}
          </p>
          <p className="text-sm text-muted-foreground">
            {config.description}
          </p>
          <p className="text-sm text-muted-foreground">
            {config.descriptionTe}
          </p>
        </div>

        {/* Quick Amount Buttons */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Quick Select</Label>
          <div className="flex flex-wrap gap-2">
            {config.quickAmounts.map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => handleQuickAmountClick(amount)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                  value === amount
                    ? 'bg-primary text-primary-foreground shadow-md scale-105'
                    : 'bg-muted hover:bg-muted/80 text-foreground hover:scale-102'
                }`}
              >
                ₹{amount.toLocaleString('en-IN')}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Label htmlFor="price-slider" className="text-sm font-medium mb-2 block">
              Select Amount
            </Label>
            <Slider
              id="price-slider"
              min={0}
              max={100}
              step={1}
              value={[priceToSlider(value)]}
              onValueChange={handleSliderChange}
              className="w-full"
            />
            <div className="relative text-xs text-muted-foreground mt-2">
              <span className="absolute left-0">₹{config.min.toLocaleString('en-IN')}</span>
              <span 
                className="absolute text-primary font-medium -translate-x-1/2"
                style={{ left: `${config.midPercent}%` }}
              >
                ₹{config.midPoint.toLocaleString('en-IN')}
              </span>
              <span className="absolute right-0">₹{config.max.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="w-32">
            <Label htmlFor="price-input" className="text-sm font-medium mb-2 block">
              Amount (₹)
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                ₹
              </span>
              <Input
                id="price-input"
                type="number"
                min={config.min}
                max={config.max}
                value={inputValue}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                className="pl-7 rounded-full text-center font-semibold text-lg"
              />
            </div>
          </div>
        </div>

        <div className="bg-primary/10 rounded-lg p-4 text-center">
          <p className="text-sm text-muted-foreground mb-1">Total Amount to Pay</p>
          <p className="text-3xl font-bold text-primary">₹{value.toLocaleString('en-IN')}</p>
        </div>
      </div>
    </Card>
  );
}
