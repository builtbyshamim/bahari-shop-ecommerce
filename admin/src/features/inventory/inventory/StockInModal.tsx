import { useForm } from 'react-hook-form';
import { FiArrowDown } from 'react-icons/fi';
import toast from 'react-hot-toast';
import InputString from '../../../components/ui/InputString';
import InputTextarea from '../../../components/ui/InputTextarea';
import { useStockInMutation } from './inventoryApi';

const StockInModal = ({ inventory, onClose }: any) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [stockIn, { isLoading }] = useStockInMutation();

  const onSubmit = async (data: any) => {
    try {
      await stockIn({ id: inventory.id, ...data }).unwrap();
      toast.success('Stock added!');
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
        <p>
          <span className="font-medium">Avg Cost:</span> ৳
          {Number(inventory?.avg_cost_price).toFixed(2)}
        </p>
      </div>
      <InputString
        name="quantity"
        label="Quantity Received"
        placeholder="Enter quantity"
        register={register}
        errors={errors}
      />
      <InputString
        name="unit_cost_price"
        label="Purchase Price (per unit)"
        placeholder="0.00"
        register={register}
        errors={errors}
      />
      <InputTextarea
        name="note"
        label="Note (optional)"
        placeholder="Supplier name, invoice no..."
        required={false}
        rows={2}
        register={register}
        errors={errors}
      />
      <button
        type="submit"
        disabled={isLoading}
        className="px-6 py-2.5 bg-green-600 text-white rounded-md hover:bg-green-500 disabled:opacity-50 flex items-center cursor-pointer"
      >
        {isLoading ? (
          <>
            <div className="animate-spin h-4 w-4 border-b-2 border-white rounded-full mr-2" />
            Processing...
          </>
        ) : (
          <>
            <FiArrowDown className="mr-2" />
            Add Stock
          </>
        )}
      </button>
    </form>
  );
};

export default StockInModal;
