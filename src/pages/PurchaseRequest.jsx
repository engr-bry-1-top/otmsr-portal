import { Wrench } from 'lucide-react'

export default function PurchaseRequest() {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <div className="w-20 h-20 rounded-full bg-maroon/5 flex items-center justify-center mb-6">
        <Wrench size={36} className="text-maroon" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Under Maintenance</h1>
      <p className="text-gray-500 max-w-md">
        The Purchase Request module is currently under development. Please check back later.
      </p>
    </div>
  )
}