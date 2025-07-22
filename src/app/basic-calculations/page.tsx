
"use client";

import React, { useState } from 'react';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Plus, Minus, X, Divide, Percent, Landmark, Binary, Superscript, Equal, Thermometer, Ruler } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// --- Type Definitions ---
type TempUnit = 'celsius' | 'fahrenheit' | 'kelvin';
type LengthUnit = 'meters' | 'feet' | 'inches';

// --- Helper Functions ---
const gcd = (a: number, b: number): number => {
  while (b) { [a, b] = [b, a % b]; }
  return a;
};
const lcm = (a: number, b: number): number => (a === 0 || b === 0) ? 0 : Math.abs(a * b) / gcd(a, b);

// --- Main Component ---
export default function CalculatorsPage() {
  const { toast } = useToast();
  
  // States for each calculator
  const [arithmetic, setArithmetic] = useState({ num1: '', num2: '', result: '' });
  const [percentage, setPercentage] = useState({ base: '', percent: '', result: '' });
  const [tax, setTax] = useState({ amount: '', rate: '', result: { tax: '', total: '' } });
  const [numberTheory, setNumberTheory] = useState({ num1: '', num2: '', result: { gcd: '', lcm: '' } });
  const [temperature, setTemperature] = useState({ value: '', from: 'celsius' as TempUnit, to: 'fahrenheit' as TempUnit, result: '' });
  const [length, setLength] = useState({ value: '', from: 'meters' as LengthUnit, to: 'feet' as LengthUnit, result: '' });
  
  const parseInput = (input: string, fieldName: string): number | null => {
    if (input.trim() === '') {
        toast({ title: "Invalid Input", description: `Please enter a value for ${fieldName}.`, variant: "destructive" });
        return null;
    }
    const num = parseFloat(input);
    if (isNaN(num)) {
      toast({ title: "Invalid Input", description: `"${input}" is not a valid number.`, variant: "destructive" });
      return null;
    }
    return num;
  };

  // --- Calculation Handlers ---
  const handleArithmetic = (operation: 'add' | 'subtract' | 'multiply' | 'divide' | 'power' | 'modulo') => {
    const n1 = parseInput(arithmetic.num1, 'Number 1');
    const n2 = parseInput(arithmetic.num2, 'Number 2');
    if (n1 === null || n2 === null) return;
    let res: number | string = '';
    switch (operation) {
      case 'add': res = n1 + n2; break;
      case 'subtract': res = n1 - n2; break;
      case 'multiply': res = n1 * n2; break;
      case 'divide': res = n2 === 0 ? 'Error: Cannot divide by zero' : n1 / n2; break;
      case 'power': res = Math.pow(n1, n2); break;
      case 'modulo': res = n1 % n2; break;
    }
    setArithmetic({ ...arithmetic, result: typeof res === 'string' ? res : res.toLocaleString() });
    if(typeof res === 'string' && res.startsWith('Error')) toast({ title: "Error", description: res, variant: "destructive" });
  };
  
  const handlePercentage = () => {
    const base = parseInput(percentage.base, 'Base Value');
    const percent = parseInput(percentage.percent, 'Percentage');
    if (base === null || percent === null) return;
    setPercentage({ ...percentage, result: ((base * percent) / 100).toLocaleString() });
  };

  const handleTax = () => {
    const amount = parseInput(tax.amount, 'Amount');
    const rate = parseInput(tax.rate, 'Tax Rate');
    if (amount === null || rate === null) return;
    const taxAmount = (amount * rate) / 100;
    setTax({ ...tax, result: { tax: taxAmount.toLocaleString(), total: (amount + taxAmount).toLocaleString() } });
  };

  const handleNumberTheory = () => {
    const n1 = parseInput(numberTheory.num1, 'Number 1');
    const n2 = parseInput(numberTheory.num2, 'Number 2');
    if (n1 === null || n2 === null || !Number.isInteger(n1) || !Number.isInteger(n2)) {
       toast({ title: "Invalid Input", description: "Inputs must be integers for LCM/GCD.", variant: "destructive" });
       return;
    }
    setNumberTheory({ ...numberTheory, result: { gcd: gcd(n1, n2).toLocaleString(), lcm: lcm(n1, n2).toLocaleString() } });
  };
  
  const handleTemperature = () => {
    const val = parseInput(temperature.value, 'Temperature Value');
    if (val === null) return;
    let celsiusVal;
    switch (temperature.from) {
        case 'celsius': celsiusVal = val; break;
        case 'fahrenheit': celsiusVal = (val - 32) * 5/9; break;
        case 'kelvin': celsiusVal = val - 273.15; break;
    }
    let res;
     switch (temperature.to) {
        case 'celsius': res = celsiusVal; break;
        case 'fahrenheit': res = celsiusVal * 9/5 + 32; break;
        case 'kelvin': res = celsiusVal + 273.15; break;
    }
    setTemperature({ ...temperature, result: res.toFixed(2) });
  };

  const handleLength = () => {
    const val = parseInput(length.value, 'Length Value');
    if (val === null) return;
    let meterVal;
    switch (length.from) {
        case 'meters': meterVal = val; break;
        case 'feet': meterVal = val / 3.281; break;
        case 'inches': meterVal = val / 39.37; break;
    }
    let res;
    switch (length.to) {
        case 'meters': res = meterVal; break;
        case 'feet': res = meterVal * 3.281; break;
        case 'inches': res = meterVal * 39.37; break;
    }
    setLength({ ...length, result: res.toFixed(3) });
  };
  

  return (
    <>
      <PageHeader
        title="Unit & Math Calculators"
        description="A collection of tools for various arithmetic, financial, and unit conversion calculations."
      />
      <div className="flex justify-center">
        <Tabs defaultValue="arithmetic" className="w-full max-w-4xl">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="arithmetic">Arithmetic</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="number-theory">Number Theory</TabsTrigger>
            <TabsTrigger value="conversions">Conversions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="arithmetic" className="pt-4">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Arithmetic Operations</CardTitle>
                <CardDescription>Perform basic math functions like addition, subtraction, and more.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input type="number" value={arithmetic.num1} onChange={e => setArithmetic({ ...arithmetic, num1: e.target.value, result: '' })} placeholder="Enter first number" />
                  <Input type="number" value={arithmetic.num2} onChange={e => setArithmetic({ ...arithmetic, num2: e.target.value, result: '' })} placeholder="Enter second number" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <Button variant="outline" onClick={() => handleArithmetic('add')}><Plus className="mr-2 h-4 w-4" /> Add</Button>
                  <Button variant="outline" onClick={() => handleArithmetic('subtract')}><Minus className="mr-2 h-4 w-4" /> Subtract</Button>
                  <Button variant="outline" onClick={() => handleArithmetic('multiply')}><X className="mr-2 h-4 w-4" /> Multiply</Button>
                  <Button variant="outline" onClick={() => handleArithmetic('divide')}><Divide className="mr-2 h-4 w-4" /> Divide</Button>
                  <Button variant="outline" onClick={() => handleArithmetic('power')}><Superscript className="mr-2 h-4 w-4" /> Power</Button>
                  <Button variant="outline" onClick={() => handleArithmetic('modulo')}><Percent className="mr-2 h-4 w-4" /> Modulo</Button>
                </div>
                {arithmetic.result && (
                  <div className="text-center bg-muted p-4 rounded-md border">
                      <Label className="text-sm text-muted-foreground">Result</Label>
                      <p className="text-3xl font-bold text-primary">{arithmetic.result}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financial" className="pt-4 grid md:grid-cols-2 gap-6">
            <Card className="shadow-lg">
                <CardHeader><CardTitle className="flex items-center"><Percent className="mr-2 h-5 w-5" /> Percentage Calculator</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input type="number" value={percentage.percent} onChange={e => setPercentage({...percentage, percent: e.target.value, result: ''})} placeholder="Percentage (%)" />
                        <Input type="number" value={percentage.base} onChange={e => setPercentage({...percentage, base: e.target.value, result: ''})} placeholder="Base Value" />
                    </div>
                    <Button onClick={handlePercentage} className="w-full"><Equal className="mr-2 h-4 w-4"/> Calculate</Button>
                    {percentage.result && (
                        <div className="text-center bg-muted p-3 rounded-md border">
                           <Label className="text-sm text-muted-foreground">Result</Label>
                           <p className="text-2xl font-bold text-primary">{percentage.result}</p>
                        </div>
                    )}
                </CardContent>
            </Card>
            <Card className="shadow-lg">
                <CardHeader><CardTitle className="flex items-center"><Landmark className="mr-2 h-5 w-5" /> Tax Calculator</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input type="number" value={tax.amount} onChange={e => setTax({...tax, amount: e.target.value, result: { tax: '', total: '' }})} placeholder="Amount" />
                        <Input type="number" value={tax.rate} onChange={e => setTax({...tax, rate: e.target.value, result: { tax: '', total: '' }})} placeholder="Tax Rate (%)" />
                    </div>
                    <Button onClick={handleTax} className="w-full"><Equal className="mr-2 h-4 w-4"/> Calculate</Button>
                    {tax.result.tax && (
                        <div className="text-center bg-muted p-3 rounded-md border grid grid-cols-2 gap-4">
                           <div><Label className="text-sm text-muted-foreground">Tax</Label><p className="text-lg font-bold text-primary">{tax.result.tax}</p></div>
                           <div><Label className="text-sm text-muted-foreground">Total</Label><p className="text-lg font-bold text-primary">{tax.result.total}</p></div>
                        </div>
                    )}
                </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="number-theory" className="pt-4">
            <Card className="shadow-lg">
              <CardHeader><CardTitle>Number Theory</CardTitle><CardDescription>Calculate Greatest Common Divisor (GCD) and Least Common Multiple (LCM).</CardDescription></CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input type="number" step="1" value={numberTheory.num1} onChange={e => setNumberTheory({...numberTheory, num1: e.target.value, result: {gcd: '', lcm: ''}})} placeholder="Enter first integer" />
                    <Input type="number" step="1" value={numberTheory.num2} onChange={e => setNumberTheory({...numberTheory, num2: e.target.value, result: {gcd: '', lcm: ''}})} placeholder="Enter second integer" />
                </div>
                <Button onClick={handleNumberTheory} className="w-full sm:w-auto"><Binary className="mr-2 h-4 w-4" /> Calculate GCD & LCM</Button>
                {numberTheory.result.gcd && (
                    <div className="text-center bg-muted p-4 rounded-md border grid grid-cols-2 gap-4">
                       <div><Label className="text-sm text-muted-foreground">GCD</Label><p className="text-2xl font-bold text-primary">{numberTheory.result.gcd}</p></div>
                       <div><Label className="text-sm text-muted-foreground">LCM</Label><p className="text-2xl font-bold text-primary">{numberTheory.result.lcm}</p></div>
                    </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="conversions" className="pt-4 grid md:grid-cols-2 gap-6">
             <Card className="shadow-lg">
                <CardHeader><CardTitle className="flex items-center"><Thermometer className="mr-2 h-5 w-5" /> Temperature Converter</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <Input type="number" value={temperature.value} onChange={e => setTemperature({...temperature, value: e.target.value, result: ''})} placeholder="Enter temperature" />
                    <div className="flex items-center gap-2"><Label className="w-16">From:</Label><Select value={temperature.from} onValueChange={v => setTemperature({...temperature, from: v as TempUnit})}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="celsius">Celsius</SelectItem><SelectItem value="fahrenheit">Fahrenheit</SelectItem><SelectItem value="kelvin">Kelvin</SelectItem></SelectContent></Select></div>
                    <div className="flex items-center gap-2"><Label className="w-16">To:</Label><Select value={temperature.to} onValueChange={v => setTemperature({...temperature, to: v as TempUnit})}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="celsius">Celsius</SelectItem><SelectItem value="fahrenheit">Fahrenheit</SelectItem><SelectItem value="kelvin">Kelvin</SelectItem></SelectContent></Select></div>
                    <Button onClick={handleTemperature} className="w-full"><Equal className="mr-2 h-4 w-4"/> Convert</Button>
                    {temperature.result && <div className="text-center bg-muted p-3 rounded-md border"><Label className="text-sm text-muted-foreground">Result</Label><p className="text-2xl font-bold text-primary">{temperature.result} °{temperature.to.charAt(0).toUpperCase()}</p></div>}
                </CardContent>
            </Card>
             <Card className="shadow-lg">
                <CardHeader><CardTitle className="flex items-center"><Ruler className="mr-2 h-5 w-5" /> Length Converter</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <Input type="number" value={length.value} onChange={e => setLength({...length, value: e.target.value, result: ''})} placeholder="Enter length" />
                    <div className="flex items-center gap-2"><Label className="w-16">From:</Label><Select value={length.from} onValueChange={v => setLength({...length, from: v as LengthUnit})}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="meters">Meters</SelectItem><SelectItem value="feet">Feet</SelectItem><SelectItem value="inches">Inches</SelectItem></SelectContent></Select></div>
                    <div className="flex items-center gap-2"><Label className="w-16">To:</Label><Select value={length.to} onValueChange={v => setLength({...length, to: v as LengthUnit})}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="meters">Meters</SelectItem><SelectItem value="feet">Feet</SelectItem><SelectItem value="inches">Inches</SelectItem></SelectContent></Select></div>
                    <Button onClick={handleLength} className="w-full"><Equal className="mr-2 h-4 w-4"/> Convert</Button>
                    {length.result && <div className="text-center bg-muted p-3 rounded-md border"><Label className="text-sm text-muted-foreground">Result</Label><p className="text-2xl font-bold text-primary">{length.result} {length.to}</p></div>}
                </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
