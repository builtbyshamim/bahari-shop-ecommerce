import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import InputString from '../../../components/ui/InputString';
import InputTextarea from '../../../components/ui/InputTextarea';
import { useAdjustStockMutation } from './inventoryApi';

const AdjustStockModal = ({ inventory, onClose }: any) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: { type: 'in' } });
  const [adjustStock, { isLoading }] = useAdjustStockMutation();
  const type = watch('type');

  const onSubmit = async (data: any) => {
    try {
      await adjustStock({ id: inventory.id, ...data }).unwrap();
      toast.success('Adjustment saved!');
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
        <p>
          <span className="font-medium">Product:</span> {inventory?.product?.name}
        </p>
        <p>
          <span className="font-medium">Current Stock:</span> {inventory?.qty_on_hand}
        </p>
      </div>

      {/* Type selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Adjustment Type</label>
        <div className="flex gap-3">
          <label
            className={`flex-1 flex items-center justify-center gap-2 p-2 rounded-lg border-2 cursor-pointer transition-colors ${type === 'in' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200'}`}
          >
            <input type="radio" value="in" {...register('type')} className="hidden" />↑ Add Stock
          </label>
          <label
            className={`flex-1 flex items-center justify-center gap-2 p-2 rounded-lg border-2 cursor-pointer transition-colors ${type === 'out' ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200'}`}
          >
            <input type="radio" value="out" {...register('type')} className="hidden" />↓ Remove
            Stock
          </label>
        </div>
      </div>

      <InputString
        name="quantity"
        label="Quantity"
        placeholder="Enter quantity"
        register={register}
        errors={errors}
      />
      <InputTextarea
        name="note"
        label="Reason (required)"
        placeholder="e.g. Damaged goods, recount correction..."
        rows={2}
        register={register}
        errors={errors}
      />

      <button
        type="submit"
        disabled={isLoading}
        className={`px-6 py-2.5 text-white rounded-md disabled:opacity-50 flex items-center cursor-pointer ${type === 'out' ? 'bg-red-500 hover:bg-red-400' : 'bg-blue-600 hover:bg-blue-500'}`}
      >
        {isLoading ? (
          <>
            <div className="animate-spin h-4 w-4 border-b-2 border-white rounded-full mr-2" />
            Saving...
          </>
        ) : (
          'Save Adjustment'
        )}
      </button>
    </form>
  );
};

export default AdjustStockModal;
