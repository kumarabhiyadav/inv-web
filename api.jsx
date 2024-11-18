export const remoteFetch = "http://13.60.46.80:6001/api/inventory/fetchPurchase"
export const remoteCreateQR = "http://13.60.46.80:6001/api/inventory/createQRCode"
export const printLocal = "http://localhost:8000/generate-receipt"

export function formateDate(data) {
    const date = new Date(data);

    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const year = date.getFullYear();
    const formattedDate = `${month}/${year}`;

    return (formattedDate);
}