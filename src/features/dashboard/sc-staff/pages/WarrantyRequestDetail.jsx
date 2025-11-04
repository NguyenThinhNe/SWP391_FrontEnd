import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CalendarBlank, Info, Car, Gear, Warning, Camera, Headphones } from 'phosphor-react'
import { useSCStaffApi } from '../../../../api/useSCStaffApi'
import Loader from '../../../../components/Loader'

const InfoCard = ({ icon: Icon, title, children }) => (
  <div className="border-[3px] border-[#EBEBEB] rounded-2xl p-6">
    <div className="flex items-center gap-3 mb-6">
      <Icon size={29} className="text-[#626AE7]" />
      <h3 className="text-lg font-semibold text-[#686262]">{title}</h3>
    </div>
    <div className="space-y-6">
      {children}
    </div>
  </div>
)

const InfoField = ({ label, value }) => (
  <div>
    <div className="text-base font-medium text-[#6B716F] mb-2">{label}</div>
    <div className="text-xl font-medium text-black">{value}</div>
  </div>
)

const StatBadge = ({ label, value, color = 'text-black' }) => (
  <div className="border-[3px] border-[#EBEBEB] rounded-2xl px-5 py-2 inline-flex items-center gap-2">
    <span className="text-base font-semibold text-[#686262]">{label}</span>
    <span className={`text-base font-semibold ${color}`}>{value}</span>
  </div>
)

const RadioOption = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-3 cursor-pointer">
    <div className="relative">
      <div className={`w-5 h-5 rounded-full border-2 ${checked ? 'border-[#626AE7] bg-[#626AE7]' : 'border-[#6B7280] bg-white'}`} />
      {checked && <div className="w-3 h-3 rounded-full bg-white absolute top-1 left-1" />}
    </div>
    <span className="text-lg font-medium text-[#686262]">{label}</span>
  </label>
)

export default function WarrantyRequestDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { fetchClaimById, approveClaim, rejectClaim, loading, error } = useSCStaffApi()
  const [claimData, setClaimData] = useState(null)
  const [selectedRequest, setSelectedRequest] = useState('replacement')
  const [showPartModal, setShowPartModal] = useState(false)

  useEffect(() => {
    const loadClaimData = async () => {
      try {
        const data = await fetchClaimById(id)
        setClaimData(data)
      } catch (err) {
        console.error('Failed to load claim:', err)
      }
    }
    
    if (id) {
      loadClaimData()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const handleAcceptRequest = async () => {
    try {
      await approveClaim(id)
      alert('Claim approved successfully!')
      navigate('/sc-staff/dashboard')
    } catch {
      alert('Failed to approve claim')
    }
  }

  const handleRejectRequest = async () => {
    if (window.confirm('Are you sure you want to reject this claim?')) {
      try {
        await rejectClaim(id)
        alert('Claim rejected successfully!')
        navigate('/sc-staff/dashboard')
      } catch {
        alert('Failed to reject claim')
      }
    }
  }

  if (loading || !claimData) return <Loader />
  if (error) return <div className="p-12">Error loading claim details</div>

  return (
    <div className="p-12 w-full">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-[30px] font-semibold text-black mb-1">Hello, SC Staff</h1>
          <p className="text-xl font-semibold text-[#929594]">An overview of your works.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-[17px] font-semibold text-[#393C3B]">16 May, 2025</span>
          <div className="w-[45px] h-[45px] rounded-full bg-[#F1F3F4] flex items-center justify-center">
            <CalendarBlank size={25} className="text-black" />
          </div>
        </div>
      </div>

      <div className="flex gap-4 mb-8 flex-wrap">
        <StatBadge label="Total Claim:" value="254" />
        <StatBadge label="Pending:" value="200" />
        <StatBadge label="In Progress:" value="50" color="text-[#EBB80F]" />
        <StatBadge label="Completed:" value="03" color="text-[#54C020]" />
        <StatBadge label="Overdue:" value="01" color="text-[#C02020]" />
      </div>

      <div className="mb-8">
        <h2 className="text-[25px] font-semibold text-black mb-2">Warranty Request Detail</h2>
        <p className="text-base text-[#4B5563]">Fill out the form below to submit a new warranty claim request for electric vehicle components.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <InfoCard icon={Info} title="Basic Information">
          <div className="grid grid-cols-2 gap-6">
            <InfoField label="Claim ID" value={claimData.claimId || claimData.id || id} />
            <InfoField label="Claim Date" value={claimData.claimDate || claimData.createdAt || 'N/A'} />
            <InfoField label="Created By" value={claimData.createdBy || claimData.customerName || 'N/A'} />
            <InfoField label="Manufacturer" value={claimData.manufacturer || 'N/A'} />
            <div className="col-span-2">
              <InfoField label="Service Center" value={claimData.serviceCenter || claimData.serviceCenterName || 'N/A'} />
            </div>
          </div>
        </InfoCard>

        <InfoCard icon={Car} title="Vehicle Information">
          <div className="grid grid-cols-2 gap-6">
            <InfoField label="VIN Code" value={claimData.vinCode || claimData.vehicleId || 'N/A'} />
            <InfoField label="Vehicle Name" value={claimData.vehicleName || 'N/A'} />
            <InfoField label="Current Mileage (km)" value={claimData.currentMileage || claimData.mileage || 'N/A'} />
            <InfoField label="Purchase Date of Vehicle" value={claimData.purchaseDate || 'N/A'} />
          </div>
        </InfoCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <InfoCard icon={Gear} title="Part Information">
          <div className="grid grid-cols-2 gap-6">
            <InfoField label="Part Name" value={claimData.partName || 'N/A'} />
            <InfoField label="Part Code" value={claimData.partCode || 'N/A'} />
            <div className="col-span-2">
              <InfoField label="Replacement Date" value={claimData.replacementDate || 'N/A'} />
            </div>
          </div>
        </InfoCard>

        <InfoCard icon={Headphones} title="Service Center Request">
          <div className="space-y-4">
            <RadioOption 
              label="Request replacement part approval" 
              checked={selectedRequest === 'replacement'}
              onChange={() => setSelectedRequest('replacement')}
            />
            <RadioOption 
              label="Request repair approval" 
              checked={selectedRequest === 'repair'}
              onChange={() => setSelectedRequest('repair')}
            />
            <RadioOption 
              label="Request reimbursement (repair completed in advance)" 
              checked={selectedRequest === 'reimbursement'}
              onChange={() => setSelectedRequest('reimbursement')}
            />
          </div>
        </InfoCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <InfoCard icon={Warning} title="Issue Details">
          <div className="border-[3px] border-[#F4F4F4] rounded-2xl p-6 bg-white">
            <div className="text-base font-medium text-[#6B716F] mb-3">Issue Description</div>
            <p className="text-xl font-medium text-black leading-relaxed">
              {claimData.issueDescription || claimData.description || claimData.issue || 'No description provided'}
            </p>
          </div>
        </InfoCard>

        <div className="border-[3px] border-[#EBEBEB] rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="text-lg font-semibold text-[#686262]">Actions</div>
          </div>
          <div className="space-y-3">
            <button 
              onClick={handleAcceptRequest}
              disabled={loading}
              className="w-full py-3 bg-[#626AE7] rounded-2xl text-sm font-semibold text-white hover:bg-[#5159c9] transition-colors disabled:opacity-50"
            >
              Accept Request
            </button>
            <button 
              onClick={handleRejectRequest}
              disabled={loading}
              className="w-full py-3 bg-[#F1F3F4] rounded-2xl text-sm font-semibold text-black hover:bg-[#e5e7e9] transition-colors disabled:opacity-50"
            >
              Reject Request
            </button>
            <button 
              onClick={() => setShowPartModal(true)}
              className="w-full py-3 bg-[#F1F3F4] rounded-2xl text-sm font-semibold text-black hover:bg-[#e5e7e9] transition-colors"
            >
              Parts request
            </button>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <InfoCard icon={Camera} title="Evidence Upload">
          <div className="border-[3px] border-dashed border-[#EBEBEB] rounded-2xl p-6 bg-white">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {(claimData.images || claimData.evidenceImages || []).length > 0 ? (
                (claimData.images || claimData.evidenceImages).map((image, index) => (
                  <div key={index} className="aspect-[3/2] rounded-xl overflow-hidden">
                    <img 
                      src={image} 
                      alt={`Evidence ${index + 1}`} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center py-8 text-gray-500">
                  No evidence images uploaded
                </div>
              )}
            </div>
          </div>
        </InfoCard>
      </div>

      {/* Part Request Modal */}
      {showPartModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowPartModal(false)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-medium text-gray-600">Part request for order {id || 'RO-002'}</h3>
              <button 
                onClick={() => setShowPartModal(false)}
                className="w-6 h-6 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M12 4L4 12M4 4L12 12" stroke="#6B7280" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            {/* Part Information Card */}
            <div className="border-2 border-gray-200 rounded-2xl p-5 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Gear size={24} className="text-[#626AE7]" />
                <h4 className="text-base font-semibold text-gray-700">Part Information</h4>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Part Name</div>
                    <div className="text-base font-semibold text-black">{claimData.partName || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Part Code</div>
                    <div className="text-base font-semibold text-black">{claimData.partCode || 'N/A'}</div>
                  </div>
                </div>
                
                <div>
                  <div className="text-xs text-gray-500 mb-1">Replacement Date</div>
                  <div className="text-base font-semibold text-black">{claimData.replacementDate || 'N/A'}</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button 
                onClick={() => setShowPartModal(false)}
                className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  // Handle request submission
                  console.log('Part request submitted')
                  setShowPartModal(false)
                }}
                className="flex-1 py-2.5 bg-[#626AE7] text-white rounded-xl text-sm font-semibold hover:bg-[#5159d6] transition-colors"
              >
                Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
