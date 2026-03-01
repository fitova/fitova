"use client";
import React, { useEffect, useState } from "react";
import { addAddress } from "@/lib/queries/addresses";
import toast from "react-hot-toast";

interface AddressModalProps {
  isOpen: boolean;
  closeModal: () => void;
  onAddressAdded?: () => void;
}

const EMPTY_FORM = {
  full_name: "",
  phone: "",
  address_line_1: "",
  address_line_2: "",
  city: "",
  state: "",
  postal_code: "",
  country: "",
  label: "",
  is_default: false,
};

const AddressModal = ({ isOpen, closeModal, onAddressAdded }: AddressModalProps) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!(event.target as HTMLElement).closest(".modal-content")) {
        closeModal();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, closeModal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name || !form.address_line_1 || !form.city || !form.country) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSaving(true);
    try {
      await addAddress(form);
      toast.success("Address saved!");
      setForm(EMPTY_FORM);
      onAddressAdded?.();
      closeModal();
    } catch (err: any) {
      toast.error(err.message || "Failed to save address.");
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 text-sm";

  return (
    <div
      className={`fixed top-0 left-0 overflow-y-auto no-scrollbar w-full h-screen sm:py-20 xl:py-25 2xl:py-[230px] bg-dark/70 sm:px-8 px-4 py-5 ${isOpen ? "block z-99999" : "hidden"}`}
    >
      <div className="flex items-center justify-center">
        <div className="w-full max-w-[700px] rounded-xl shadow-3 bg-white p-7.5 relative modal-content">
          <button
            onClick={closeModal}
            aria-label="Close modal"
            className="absolute top-3 right-3 flex items-center justify-center w-10 h-10 rounded-full ease-in duration-150 bg-meta text-body hover:text-dark"
          >
            <svg className="fill-current" width="22" height="22" viewBox="0 0 26 26" fill="none">
              <path fillRule="evenodd" clipRule="evenodd" d="M14.3108 13L19.2291 8.08167C19.5866 7.72417 19.5866 7.12833 19.2291 6.77083C19.0543 6.59895 18.8189 6.50262 18.5737 6.50262C18.3285 6.50262 18.0932 6.59895 17.9183 6.77083L13 11.6892L8.08164 6.77083C7.90679 6.59895 7.67142 6.50262 7.42623 6.50262C7.18104 6.50262 6.94566 6.59895 6.77081 6.77083C6.41331 7.12833 6.41331 7.72417 6.77081 8.08167L11.6891 13L6.77081 17.9183C6.41331 18.2758 6.41331 18.8717 6.77081 19.2292C7.12831 19.5867 7.72414 19.5867 8.08164 19.2292L13 14.3108L17.9183 19.2292C18.2758 19.5867 18.8716 19.5867 19.2291 19.2292C19.5866 18.8717 19.5866 18.2758 19.2291 17.9183L14.3108 13Z" fill="" />
            </svg>
          </button>

          <h3 className="text-lg font-medium text-dark mb-5">Add New Address</h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="w-full">
                <label className="block mb-2 text-sm font-medium text-dark">Full Name *</label>
                <input type="text" className={inputCls} placeholder="Your full name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
              </div>
              <div className="w-full">
                <label className="block mb-2 text-sm font-medium text-dark">Phone</label>
                <input type="tel" className={inputCls} placeholder="+1 234 567 890" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-dark">Address Line 1 *</label>
              <input type="text" className={inputCls} placeholder="Street address, P.O. Box" value={form.address_line_1} onChange={(e) => setForm({ ...form, address_line_1: e.target.value })} required />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-dark">Address Line 2</label>
              <input type="text" className={inputCls} placeholder="Apartment, suite, unit, building, floor" value={form.address_line_2} onChange={(e) => setForm({ ...form, address_line_2: e.target.value })} />
            </div>

            <div className="flex flex-col lg:flex-row gap-4">
              <div className="w-full">
                <label className="block mb-2 text-sm font-medium text-dark">City *</label>
                <input type="text" className={inputCls} placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
              </div>
              <div className="w-full">
                <label className="block mb-2 text-sm font-medium text-dark">State / Province</label>
                <input type="text" className={inputCls} placeholder="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-4">
              <div className="w-full">
                <label className="block mb-2 text-sm font-medium text-dark">Postal Code</label>
                <input type="text" className={inputCls} placeholder="12345" value={form.postal_code} onChange={(e) => setForm({ ...form, postal_code: e.target.value })} />
              </div>
              <div className="w-full">
                <label className="block mb-2 text-sm font-medium text-dark">Country *</label>
                <input type="text" className={inputCls} placeholder="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} required />
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-4">
              <div className="w-full">
                <label className="block mb-2 text-sm font-medium text-dark">Label (Optional)</label>
                <input type="text" className={inputCls} placeholder="e.g. Home, Office, Apartment" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
              </div>
              <div className="w-full flex items-center gap-3 pt-2 lg:pt-7">
                <input
                  id="is_default"
                  type="checkbox"
                  checked={form.is_default}
                  onChange={(e) => setForm({ ...form, is_default: e.target.checked })}
                  className="w-4 h-4 accent-blue"
                />
                <label htmlFor="is_default" className="text-sm text-dark cursor-pointer">Set as default address</label>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex font-medium text-white bg-blue py-3 px-7 rounded-md ease-out duration-200 hover:bg-blue-dark disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Address"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddressModal;
