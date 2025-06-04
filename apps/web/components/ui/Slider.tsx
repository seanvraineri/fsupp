"use client";
import * as RadixSlider from "@radix-ui/react-slider";

interface SliderProps {
  value: number[];
  onValueChange: (v: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
}

export function Slider({ value, onValueChange, min = 1, max = 5, step = 1 }: SliderProps) {
  return (
    <RadixSlider.Root
      value={value}
      onValueChange={onValueChange}
      min={min}
      max={max}
      step={step}
      className="relative flex items-center w-full select-none touch-none h-4"
    >
      <RadixSlider.Track className="relative h-3 w-full grow overflow-hidden rounded-full bg-gray-200">
        <RadixSlider.Range className="absolute h-full bg-gradient-to-r from-purple-500 via-purple-600 to-indigo-500" />
      </RadixSlider.Track>
      <RadixSlider.Thumb className="block h-5 w-5 rounded-full bg-white border border-purple-600 shadow-lg hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-600" />
    </RadixSlider.Root>
  );
}

export default Slider; 
