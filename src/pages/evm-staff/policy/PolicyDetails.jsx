import React from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  CarIcon, 
  ClockIcon, 
  CalendarIcon,
  UserIcon,
  CaretLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilSimpleIcon,
  TrashSimpleIcon
} from '@phosphor-icons/react'

// Sample data - replace with actual data later
const policyDetails = {
  id: "POL-001",
  customerName: "John Doe",
  vehicleInfo: {
    brand: "Toyota",
    model: "Camry",
    year: "2023",
    licensePlate: "51F-123.45"
  },
  coverage: {
    startDate: "2024-01-01",
    endDate: "2025-01-01",
    status: "Active",
    type: "Comprehensive"
  },
  payments: [
    { id: 1, date: "2024-01-01", amount: "1,200,000", status: "Paid" },
    { id: 2, date: "2024-04-01", amount: "1,200,000", status: "Pending" },
    { id: 3, date: "2024-07-01", amount: "1,200,000", status: "Upcoming" }
  ]
}

const InfoCard = ({ icon: Icon, title, value }) => (
  <div className="bg-white p-6 rounded-2xl border-2 border-gray-200">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
        <Icon size={24} className="text-indigo-600" />
      </div>
      <h3 className="text-gray-500 font-medium">{title}</h3>
    </div>
    <p className="text-xl font-semibold">{value}</p>
  </div>
)

const PaymentStatus = ({ status }) => {
  const statusStyles = {
    'Paid': 'bg-green-100 text-green-700',
    'Pending': 'bg-yellow-100 text-yellow-700',
    'Upcoming': 'bg-gray-100 text-gray-700'
  }
  
  return (
    <span className={"px-3 py-1 rounded-full text-sm font-medium " + statusStyles[status]}>
      {status}
    </span>
  )
}

export default function PolicyDetails() {
  const navigate = useNavigate()

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        
        <div className="flex items-center justify-between">
          <div>
            <button 
          onClick={() => navigate('/evm-staff/policy')}
          className="p-2 hover:bg-gray-200 rounded-full transition-colors"
        >
          <CaretLeftIcon size={20} />
          {/* <span>Back to Policies</span> */}
        </button>
            <h1 className="text-3xl font-bold mb-2">Policy Details</h1>
            <p className="text-gray-500">Policy ID: {policyDetails.id}</p>
          </div>
          <span className={"px-4 py-2 rounded-full font-medium " + (
            policyDetails.coverage.status === 'Active' 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          )}>
            {policyDetails.coverage.status}
          </span>
      </div>

      {/* Policy Actions */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold mb-1">Policy Actions</h2>
            <p className="text-gray-500">Manage this policy's settings and details</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => navigate(`/evm-staff/policy/edit/${policyDetails.id}`)}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <PencilSimpleIcon size={20} weight="bold" />
              Edit Policy
            </button>
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this policy?')) {
                  // Add delete logic here
                  navigate('/evm-staff/policy');
                }
              }}
              className="flex items-center gap-2 px-6 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              <TrashSimpleIcon size={20} weight="bold" />
              Delete Policy
            </button>
          </div>
        </div>
      </div>

      {/* Info Cards Grid */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <InfoCard 
          icon={UserIcon} 
          title="Customer" 
          value={policyDetails.customerName} 
        />
        <InfoCard 
          icon={CarIcon} 
          title="Vehicle" 
          value={policyDetails.vehicleInfo.brand + " " + policyDetails.vehicleInfo.model} 
        />
        <InfoCard 
          icon={CalendarIcon} 
          title="Start Date" 
          value={policyDetails.coverage.startDate} 
        />
        <InfoCard 
          icon={ClockIcon} 
          title="End Date" 
          value={policyDetails.coverage.endDate} 
        />
      </div>

      {/* Vehicle Details */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 mb-8">
        <div className="p-6 border-b-2 border-gray-200">
          <h2 className="text-xl font-bold">Vehicle Information</h2>
        </div>
        <div className="p-6 grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-2">Brand & Model</p>
            <p className="text-lg">{policyDetails.vehicleInfo.brand} {policyDetails.vehicleInfo.model}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-2">Manufacturing Year</p>
            <p className="text-lg">{policyDetails.vehicleInfo.year}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-2">License Plate</p>
            <p className="text-lg">{policyDetails.vehicleInfo.licensePlate}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-2">Coverage Type</p>
            <p className="text-lg">{policyDetails.coverage.type}</p>
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-2xl border-2 border-gray-200">
        <div className="p-6 border-b-2 border-gray-200">
          <h2 className="text-xl font-bold">Payment History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600">Payment Date</th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600">Amount (VND)</th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600">Status</th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-gray-200">
              {policyDetails.payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="py-4 px-6">{payment.date}</td>
                  <td className="py-4 px-6">{payment.amount}</td>
                  <td className="py-4 px-6">
                    <PaymentStatus status={payment.status} />
                  </td>
                  <td className="py-4 px-6">
                    <button className="text-indigo-600 hover:text-indigo-700 font-medium text-sm">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
        </div>
        </div>
        </div>
    </div>
  )
}