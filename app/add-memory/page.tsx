import { MemoryForm } from "@/components/MemoryForm";

export default function AddMemoryPage() {
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-playfair font-bold">স্মৃতি যোগ করুন</h1>
          <p className="text-lg text-muted-foreground">মুহূর্তগুলো হারিয়ে যাওয়ার আগেই সংরক্ষণ করুন।</p>
        </div>
        
        <MemoryForm />
      </div>
    </div>
  );
}
