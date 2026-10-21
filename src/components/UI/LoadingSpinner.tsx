interface LoadingSpinnerProps {
  page: string;
}
const LoadingSpinner = ({ page = "Loading" }: LoadingSpinnerProps) => {
  return (
    <>
      <div className="pt-32 pb-0 px-6 md:px-20 min-h-screen flex items-center justify-center flex-col relative overflow-hidden">
        <h1 className="text-2xl md:text-4xl font-bold text-center">
          Open source Kigali
        </h1>
        <div className="flex gap-2 justify-center items-center">
          <div className="w-10 h-10 mx-auto border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
          <h1 className="text-xl md:text-2xl font-bold text-blue-400 text-center animate-pulse">
            Loading {page} page...
          </h1>
        </div>
      </div>
    </>
  );
};
export default LoadingSpinner;
