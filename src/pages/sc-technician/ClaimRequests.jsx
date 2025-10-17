import React, { useMemo, useState, useEffect } from 'react'
import { CalendarBlank, Plus, DotsThree, Info, Car, Package, WarningCircle, UploadSimple, MapPin } from 'phosphor-react'

const sampleClaims = [
  { id: 1, claimId: 'RO-001', vehicle: 'VinFast VF-3', vin: 'LSV1E7AL0MC123456', status: 'On hold', dueDate: '2024-07-21' },
  { id: 2, claimId: 'RO-002', vehicle: 'Neiro Green', vin: 'LSV1E7AL0MC123456', status: 'Done', dueDate: '2024-07-21' },
  { id: 3, claimId: 'RO-003', vehicle: 'VinFast VF-3', vin: 'LSV1E7AL0MC123456', status: 'On hold', dueDate: '2024-07-21' },
  { id: 4, claimId: 'RO-004', vehicle: 'VinFast VF-3', vin: 'LSV1E7AL0MC123456', status: 'Overdue', dueDate: '2024-07-21' },
  { id: 5, claimId: 'RO-005', vehicle: 'VinFast VF-3', vin: 'LSV1E7AL0MC123456', status: 'In Progress', dueDate: '2024-07-21' },
  { id: 6, claimId: 'RO-006', vehicle: 'VinFast VF-3', vin: 'LSV1E7AL0MC123457', status: 'On hold', dueDate: '2024-07-21' },
  { id: 7, claimId: 'RO-007', vehicle: 'VinFast VF-3', vin: 'LSV1E7AL0MC123458', status: 'Done', dueDate: '2024-07-21' },
  { id: 8, claimId: 'RO-008', vehicle: 'VinFast VF-3', vin: 'LSV1E7AL0MC123459', status: 'On hold', dueDate: '2024-07-21' },
  { id: 9, claimId: 'RO-009', vehicle: 'VinFast VF-3', vin: 'LSV1E7AL0MC123460', status: 'On hold', dueDate: '2024-07-21' },
  { id: 10, claimId: 'RO-010', vehicle: 'VinFast VF-3', vin: 'LSV1E7AL0MC123461', status: 'In Progress', dueDate: '2024-07-21' }
]

function StatusDot({ status }) {
  const color = {
    'On hold': 'bg-gray-400',
    'Done': 'bg-green-400',
    'Overdue': 'bg-red-400',
    'In Progress': 'bg-yellow-400'
  }[status] || 'bg-gray-400'

  return <span className={`inline-block w-2 h-2 rounded-full mr-2 ${color}`} />
}

export default function ClaimRequests() {
  const [page] = useState(1)
  const pageSize = 10
  const [activeActionId, setActiveActionId] = useState(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editClaim, setEditClaim] = useState(null)
  const [formState, setFormState] = useState({
    claimId: '',
    claimDate: '',
    serviceCenter: '',
    createdBy: '',
    manufacturer: '',
    vin: '',
    vehicleName: '',
    purchaseDate: '',
    mileage: '',
    partName: '',
    partCode: '',
    replacementDate: '',
    issueDescription: '',
    serviceRequest: ''
  })

  const [claimsList, setClaimsList] = useState(() => sampleClaims)

  const total = 247
  const showingFrom = (page - 1) * pageSize + 1
  const showingTo = Math.min(page * pageSize, total)

  useEffect(() => {
    function onDocClick() {
      setActiveActionId(null)
    }

    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [])

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteClaim, setDeleteClaim] = useState(null)

  function openDeleteModal(claim) {
    setDeleteClaim(claim)
    setShowDeleteModal(true)
    setActiveActionId(null)
  }

  function confirmDelete() {
    if (!deleteClaim) return
    setClaimsList((prev) => prev.filter((c) => c.id !== deleteClaim.id))
    setShowDeleteModal(false)
    setDeleteClaim(null)
  }

  useEffect(() => {
    if (showCreateForm) {
      if (editClaim) {
        // populate form with claim data (example mapping)
        setFormState({
          claimId: editClaim.claimId || '',
          claimDate: '',
          serviceCenter: editClaim.serviceCenter || editClaim.claimId || '',
          createdBy: 'Jso',
          manufacturer: '',
          vin: editClaim.vin || '',
          vehicleName: editClaim.vehicle || '',
          purchaseDate: '',
          mileage: '',
          partName: '',
          partCode: '',
          replacementDate: '',
          issueDescription: '',
          serviceRequest: ''
        })
      } else {
        // reset for new
        setFormState({
          claimId: '', claimDate: '', serviceCenter: '', createdBy: '', manufacturer: '', vin: '', vehicleName: '', purchaseDate: '', mileage: '', partName: '', partCode: '', replacementDate: '', issueDescription: '', serviceRequest: ''
        })
      }
    }
  }, [showCreateForm, editClaim])

  return (
    <div className="min-h-screen">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Warranty Claim Requests</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and track warranty claim requests</p>

          <div className="flex items-center gap-4 mt-6">
            <div className="flex items-center gap-4">
              <div className="w-56 h-12 rounded-full border border-gray-200 bg-white px-5 flex items-center justify-between text-sm">
                <div className="text-sm text-gray-600">Total Claim:</div>
                <div className="font-semibold">254</div>
              </div>
              <div className="w-56 h-12 rounded-full border border-gray-200 bg-white px-5 flex items-center justify-between text-sm">
                <div className="text-sm text-gray-600">Pending:</div>
                <div className="font-semibold">200</div>
              </div>
              <div className="w-56 h-12 rounded-full border border-gray-200 bg-white px-5 flex items-center justify-between text-sm">
                <div className="text-sm text-gray-600">In Progress:</div>
                <div className="font-semibold text-yellow-500">50</div>
              </div>
              <div className="w-56 h-12 rounded-full border border-gray-200 bg-white px-5 flex items-center justify-between text-sm">
                <div className="text-sm text-gray-600">Completed:</div>
                <div className="font-semibold text-green-500">03</div>
              </div>
              <div className="w-56 h-12 rounded-full border border-gray-200 bg-white px-5 flex items-center justify-between text-sm">
                <div className="text-sm text-gray-600">Overdue:</div>
                <div className="font-semibold text-red-500">01</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
            <CalendarBlank size={18} />
          </div>
        </div>
      </header>

      {!showCreateForm && (
        <div className="mt-8 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Requested warranties</h2>
          <button onClick={() => setShowCreateForm(true)} className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-full">
            <Plus size={16} weight="bold" />
            <span>Create request</span>
          </button>
        </div>
      )}

      {showCreateForm ? (
        <form onSubmit={(e) => { e.preventDefault(); setShowCreateForm(false); setEditClaim(null); }} className="mt-6 bg-white border border-gray-200 rounded-xl p-8 shadow-sm max-w-9xl mx-auto">
          <div className="mb-6">
            <h3 className="text-lg font-semibold">{editClaim ? 'Edit Warranty Claim' : 'Create New Warranty Claim'}</h3>
            <p className="text-sm text-gray-500">{editClaim ? 'Fill out the form below to edit the warranty claim.' : 'Fill out the form below to submit a new warranty claim request for electric vehicle components.'}</p>
          </div>

          <div className="space-y-4">
            <section className="border border-gray-100 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-5 h-5 bg-indigo-50 rounded flex items-center justify-center text-indigo-600"><Info size={14} weight="bold" /></div>
                <div className="font-medium">Basic Information</div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-gray-500">Claim ID</label>
                  <input value={formState.claimId} onChange={(e) => setFormState({ ...formState, claimId: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-200 p-2" />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Claim Date</label>
                  <input type="date" value={formState.claimDate} onChange={(e) => setFormState({ ...formState, claimDate: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-200 p-2" />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Service Center</label>
                  <input value={formState.serviceCenter} onChange={(e) => setFormState({ ...formState, serviceCenter: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-200 p-2" />
                </div>

                <div>
                  <label className="text-xs text-gray-500">Created By</label>
                  <input className="mt-1 block w-full rounded-md border border-gray-200 p-2" defaultValue="Jso" />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Manufacturer</label>
                  <select value={formState.manufacturer} onChange={(e) => setFormState({ ...formState, manufacturer: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-200 p-2">
                    <option value="">Select Manufacturer</option>
                  </select>
                </div>
              </div>
            </section>

            <section className="border border-gray-100 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-5 h-5 bg-indigo-50 rounded flex items-center justify-center text-indigo-600"><Car size={14} weight="bold" /></div>
                <div className="font-medium">Vehicle Information</div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-gray-500">VIN Code</label>
                  <input value={formState.vin} onChange={(e) => setFormState({ ...formState, vin: e.target.value })} placeholder="VIN code" className="mt-1 block w-full rounded-md border border-gray-200 p-2" />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Vehicle Name</label>
                  <input value={formState.vehicleName} onChange={(e) => setFormState({ ...formState, vehicleName: e.target.value })} placeholder="Enter vehicle name" className="mt-1 block w-full rounded-md border border-gray-200 p-2" />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Purchase Date of Vehicle</label>
                  <input type="date" value={formState.purchaseDate} onChange={(e) => setFormState({ ...formState, purchaseDate: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-200 p-2" />
                </div>
                <div className="col-span-3">
                  <label className="text-xs text-gray-500">Current Mileage (km)</label>
                  <input value={formState.mileage} onChange={(e) => setFormState({ ...formState, mileage: e.target.value })} placeholder="Enter mileage" className="mt-1 block w-1/3 rounded-md border border-gray-200 p-2" />
                </div>
              </div>
            </section>

            <section className="border border-gray-100 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-5 h-5 bg-indigo-50 rounded flex items-center justify-center text-indigo-600"><Package size={14} weight="bold" /></div>
                <div className="font-medium">Part Information</div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-gray-500">Part Name</label>
                  <input value={formState.partName} onChange={(e) => setFormState({ ...formState, partName: e.target.value })} placeholder="Enter VIN code" className="mt-1 block w-full rounded-md border border-gray-200 p-2" />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Part Code</label>
                  <input value={formState.partCode} onChange={(e) => setFormState({ ...formState, partCode: e.target.value })} placeholder="Enter vehicle name" className="mt-1 block w-full rounded-md border border-gray-200 p-2" />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Replacement Date</label>
                  <input type="date" value={formState.replacementDate} onChange={(e) => setFormState({ ...formState, replacementDate: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-200 p-2" />
                </div>
              </div>
            </section>

            <section className="border border-gray-100 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-5 h-5 bg-indigo-50 rounded flex items-center justify-center text-indigo-600"><WarningCircle size={14} weight="bold" /></div>
                <div className="font-medium">Issue Details</div>
              </div>
    <div>
                <label className="text-xs text-gray-500">Issue Description</label>
                <textarea value={formState.issueDescription} onChange={(e) => setFormState({ ...formState, issueDescription: e.target.value })} placeholder="Provide a detailed description of the issue..." className="mt-1 block w-full rounded-md border border-gray-200 p-3 h-28" />
              </div>
            </section>

            <section className="border border-gray-100 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-5 h-5 bg-indigo-50 rounded flex items-center justify-center text-indigo-600"><UploadSimple size={14} weight="bold" /></div>
                <div className="font-medium">Evidence Upload</div>
              </div>
              <div className="border-dashed border-2 border-gray-200 rounded-md p-6 text-center">
                <div className="text-sm text-gray-500">Upload Images or Videos</div>
                <div className="mt-3">
                  <input type="file" className="mx-auto" />
                </div>
              </div>
            </section>

            <section className="border border-gray-100 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-5 h-5 bg-indigo-50 rounded flex items-center justify-center text-indigo-600"><MapPin size={14} weight="bold" /></div>
                <div className="font-medium">Service Center Request</div>
              </div>
              <div className="space-y-2 text-sm">
                <label className="flex items-center gap-2"><input type="radio" name="service" checked={formState.serviceRequest === 'replacement'} onChange={() => setFormState({ ...formState, serviceRequest: 'replacement' })} /> Request replacement part approval</label>
                <label className="flex items-center gap-2"><input type="radio" name="service" checked={formState.serviceRequest === 'repair'} onChange={() => setFormState({ ...formState, serviceRequest: 'repair' })} /> Request repair approval</label>
                <label className="flex items-center gap-2"><input type="radio" name="service" checked={formState.serviceRequest === 'reimbursement'} onChange={() => setFormState({ ...formState, serviceRequest: 'reimbursement' })} /> Request reimbursement (repair completed in advance)</label>
              </div>
            </section>
          </div>

          <div className="mt-6 flex justify-end gap-4">
            <button type="button" onClick={() => { setShowCreateForm(false); setEditClaim(null); }} className="px-4 py-2 border rounded-md">Cancel</button>
            <button type="submit" className={`px-4 py-2 text-white rounded-md ${editClaim ? 'bg-indigo-700' : 'bg-indigo-600'}`}>{editClaim ? 'Save Changes' : 'Submit Claim'}</button>
          </div>
        </form>
      ) : (
        <div className="mt-6 bg-white border border-gray-200 rounded-xl p-8 shadow-sm max-w-9xl mx-auto">
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
                  <th className="py-4 px-4">Claim ID</th>
                  <th className="py-4 px-4">Vehicle</th>
                  <th className="py-4 px-4">Vin ID</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4">Due Date</th>
                  <th className="py-4 px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-700">
              {claimsList.map((c) => (
                  <tr key={c.id} className="border-b last:border-b-0">
                    <td className="py-4 px-4 font-semibold">{c.claimId}</td>
                    <td className="py-4 px-4">{c.vehicle}</td>
                    <td className="py-4 px-4">{c.vin}</td>
                    <td className="py-4 px-4 flex items-center">
                      <StatusDot status={c.status} />
                      <span className="text-sm">{c.status}</span>
                    </td>
                    <td className="py-4 px-4">{c.dueDate}</td>
                    <td className="py-4 px-4 relative">
                      <button onClick={(e) => { e.stopPropagation(); setActiveActionId(activeActionId === c.id ? null : c.id) }} className="p-2 rounded-full hover:bg-gray-100">
                        <DotsThree size={20} />
                      </button>

                    {activeActionId === c.id && (
                      <div className="absolute right-2 top-10 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                        <button onClick={(e) => { e.stopPropagation(); setActiveActionId(null); setEditClaim(c); setShowCreateForm(true); }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">Edit</button>
                        <button onClick={(e) => { e.stopPropagation(); openDeleteModal(c); }} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-50">Remove</button>
                      </div>
                    )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
            <div>Showing {showingFrom} to {showingTo} of {total} results</div>
            <div className="flex items-center gap-3">
              <button className="px-2 py-1">Previous</button>
              <div className="flex items-center gap-2">
                <button className="w-7 h-7 rounded-full bg-indigo-600 text-white">1</button>
                <button className="w-7 h-7 rounded-full bg-white border">2</button>
                <button className="w-7 h-7 rounded-full bg-white border">3</button>
                <button className="w-7 h-7 rounded-full bg-white border">4</button>
              </div>
              <button className="px-2 py-1">Next</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && deleteClaim && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black opacity-30" onClick={() => setShowDeleteModal(false)} />
          <div className="bg-white rounded-lg shadow-lg w-96 border border-gray-200 z-10">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <div className="text-sm text-gray-600">Delete warranty request for <span className="font-semibold">{deleteClaim.claimId}/{deleteClaim.vehicle}</span></div>
              <button onClick={() => setShowDeleteModal(false)} className="text-gray-400">✕</button>
            </div>
            <div className="p-6 text-center">
              <div className="mb-4">
                <div className="w-10 h-10 mx-auto rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600"> <Car size={20} weight="bold" /> </div>
              </div>
              <div className="font-semibold mb-1">{deleteClaim.claimId}/{deleteClaim.vehicle}</div>
              <div className="text-sm text-gray-500 mb-6">Car Owner: Jso</div>
              <button onClick={confirmDelete} className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md">I want to delete this request</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
