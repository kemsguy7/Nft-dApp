import { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import { useAppContext } from './contexts/appContext';
import NFTCard from './components/NFTCard';
import useMintToken from './hooks/useMintToken';
import useTransferToken from './hooks/useTransferToken';
import { useAccount } from 'wagmi';
import { Toaster } from 'react-hot-toast'; // Import Toaster for toast notifications

function App() {
  const { nextTokenId, tokenMetaData, mintPrice, ownedTokens, loading } = useAppContext();
  const { address, isConnected } = useAccount(); // Properly get isConnected from useAccount
  const [activeTab, setActiveTab] = useState('marketplace');
  const tokenMetaDataArray = Array.from(tokenMetaData.values());
  const mintTokenHook = useMintToken();
  const transferTokenHook = useTransferToken();

  // Pagination state
  const ITEMS_PER_PAGE = 12;
  const [currentPage, setCurrentPage] = useState(1);
  const [ownedCurrentPage, setOwnedCurrentPage] = useState(1);

  // Calculate total pages for marketplace and owned NFTs
  const totalMarketplacePages = Math.ceil(tokenMetaDataArray.length / ITEMS_PER_PAGE);
  const totalOwnedPages = Math.ceil(ownedTokens.length / ITEMS_PER_PAGE);

  // Get current items for display based on pagination
  const indexOfLastMarketplaceItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstMarketplaceItem = indexOfLastMarketplaceItem - ITEMS_PER_PAGE;
  const currentMarketplaceItems = tokenMetaDataArray.slice(
    indexOfFirstMarketplaceItem,
    indexOfLastMarketplaceItem,
  );

  const indexOfLastOwnedItem = ownedCurrentPage * ITEMS_PER_PAGE;
  const indexOfFirstOwnedItem = indexOfLastOwnedItem - ITEMS_PER_PAGE;
  const currentOwnedTokens = ownedTokens.slice(indexOfFirstOwnedItem, indexOfLastOwnedItem);

  // Reset pagination when tab changes
  useEffect(() => {
    setCurrentPage(1);
    setOwnedCurrentPage(1);
  }, [activeTab]);

  // Form state for transfer functionality
  const [transferForm, setTransferForm] = useState({
    tokenId: '',
    toAddress: '',
  });

  const handleTransferFormChange = (e) => {
    setTransferForm({
      ...transferForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    if (!transferForm.tokenId || !transferForm.toAddress) return;

    try {
      const success = await transferTokenHook.transferToken(
        transferForm.tokenId,
        transferForm.toAddress,
      );
      if (success) {
        // Reset form after successful transfer
        setTransferForm({
          tokenId: '',
          toAddress: '',
        });
      }
    } catch (error) {
      console.error('Transfer failed:', error);
    }
  };

  // Pagination controls
  const paginate = (pageNumber, isOwnedTab = false) => {
    if (isOwnedTab) {
      setOwnedCurrentPage(pageNumber);
    } else {
      setCurrentPage(pageNumber);
    }
    // Scroll to top of grid when page changes
    window.scrollTo({
      top: document.getElementById('nft-grid').offsetTop - 100,
      behavior: 'smooth',
    });
  };

  const renderPaginationControls = (totalPages, currentPageState, isOwnedTab = false) => {
    if (totalPages <= 1) return null;

    return (
      <div className='flex justify-center mt-8 space-x-2'>
        <button
          onClick={() => paginate(currentPageState > 1 ? currentPageState - 1 : 1, isOwnedTab)}
          disabled={currentPageState === 1}
          className='px-4 py-2 rounded-md bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
        >
          Previous
        </button>

        <div className='flex space-x-1 overflow-x-auto max-w-xs sm:max-w-none px-1'>
          {Array.from({ length: totalPages }, (_, i) => {
            // Show limited page numbers for better mobile experience
            const pageNum = i + 1;

            // Always show first page, last page, current page, and one page before/after current
            if (
              pageNum === 1 ||
              pageNum === totalPages ||
              (pageNum >= currentPageState - 1 && pageNum <= currentPageState + 1)
            ) {
              return (
                <button
                  key={i}
                  onClick={() => paginate(pageNum, isOwnedTab)}
                  className={`w-10 h-10 rounded-md ${
                    pageNum === currentPageState
                      ? 'bg-primary text-white'
                      : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            } else if (
              (pageNum === 2 && currentPageState > 3) ||
              (pageNum === totalPages - 1 && currentPageState < totalPages - 2)
            ) {
              // Show ellipsis for skipped pages
              return (
                <span key={i} className='flex items-center justify-center w-10 h-10'>
                  ...
                </span>
              );
            }
            return null;
          })}
        </div>

        <button
          onClick={() =>
            paginate(currentPageState < totalPages ? currentPageState + 1 : totalPages, isOwnedTab)
          }
          disabled={currentPageState === totalPages}
          className='px-4 py-2 rounded-md bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div className='flex flex-col min-h-screen bg-gray-50'>
      <Toaster position='top-right' />
      <Header />
      <main className='flex-grow p-4 md:p-6 max-w-7xl mx-auto w-full'>
        <div className='text-center mb-8'>
          <h1 className='text-4xl font-bold text-gray-800 mb-2'>NFT Marketplace</h1>
          <p className='text-primary font-medium text-lg'>
            Mint, manage, and trade your digital collectibles
          </p>
        </div>

        {/* Feature cards */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-10'>
          <div className='border-l-4 border-primary p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow'>
            <h2 className='text-xl font-bold text-gray-800 mb-2'>Mint NFT</h2>
            <p className='text-gray-600'>
              Create unique digital assets and add them to your collection
            </p>
          </div>
          <div className='border-l-4 border-primary p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow'>
            <h2 className='text-xl font-bold text-gray-800 mb-2'>Manage NFTs</h2>
            <p className='text-gray-600'>View and transfer your owned digital collectibles</p>
          </div>
          <div className='border-l-4 border-primary p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow'>
            <h2 className='text-xl font-bold text-gray-800 mb-2'>Marketplace</h2>
            <p className='text-gray-600'>Explore and purchase NFTs from other creators</p>
          </div>
        </div>

        {/* Tab navigation */}
        <div className='flex border-b border-gray-200 mb-6'>
          <button
            className={`py-3 px-6 font-medium text-sm transition-colors 
              ${
                activeTab === 'marketplace'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            onClick={() => setActiveTab('marketplace')}
          >
            Marketplace
          </button>
          <button
            className={`py-3 px-6 font-medium text-sm transition-colors 
              ${
                activeTab === 'owned'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            onClick={() => setActiveTab('owned')}
          >
            My NFTs
          </button>
        </div>

        {/* Tab content */}
        {activeTab === 'marketplace' ? (
          <div>
            {loading ? (
              <div
                id='nft-grid'
                className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'
              >
                {[...Array(Math.min(ITEMS_PER_PAGE, 4))].map((_, index) => (
                  <div
                    key={`skeleton-${index}`}
                    className='animate-pulse rounded-xl overflow-hidden bg-white shadow-md'
                  >
                    <div className='bg-gray-200 h-64 w-full'></div>
                    <div className='p-4 space-y-3'>
                      <div className='h-4 bg-gray-200 rounded w-3/4'></div>
                      <div className='h-3 bg-gray-200 rounded w-full'></div>
                      <div className='h-3 bg-gray-200 rounded w-full'></div>
                      <div className='h-3 bg-gray-200 rounded w-2/3'></div>
                      <div className='mt-4 h-10 bg-gray-200 rounded w-full'></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div
                  id='nft-grid'
                  className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'
                >
                  {currentMarketplaceItems.map((token, i) => (
                    <NFTCard
                      key={`marketplace-${indexOfFirstMarketplaceItem + i}`}
                      metadata={token}
                      mintPrice={mintPrice}
                      tokenId={indexOfFirstMarketplaceItem + i}
                      nextTokenId={nextTokenId}
                      mintNFT={mintTokenHook}
                    />
                  ))}
                </div>

                {/* Marketplace Pagination */}
                {renderPaginationControls(totalMarketplacePages, currentPage, false)}

                {/* Show "No results" when there are no NFTs */}
                {tokenMetaDataArray.length === 0 && (
                  <div className='text-center py-10 bg-white rounded-lg mt-6'>
                    <p className='text-gray-500'>No NFTs available in the marketplace.</p>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <div>
            {/* Transfer NFT Form */}
            {ownedTokens.length > 0 && (
              <div className='bg-white p-6 rounded-lg shadow-sm mb-6'>
                <h3 className='text-lg font-bold mb-4'>Transfer NFT</h3>
                <form onSubmit={handleTransfer} className='space-y-4'>
                  <div>
                    <label
                      htmlFor='tokenId'
                      className='block text-sm font-medium text-gray-700 mb-1'
                    >
                      Token ID
                    </label>
                    <select
                      id='tokenId'
                      name='tokenId'
                      className='w-full p-2 border border-gray-300 rounded-md'
                      value={transferForm.tokenId}
                      onChange={handleTransferFormChange}
                      required
                    >
                      <option value=''>Select Token ID</option>
                      {ownedTokens.map((id) => {
                        const token = tokenMetaData.get(Number(id));
                        const tokenName = token ? token.name : `Token #${id}`;
                        return (
                          <option key={id} value={id}>
                            {id} - {tokenName}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor='toAddress'
                      className='block text-sm font-medium text-gray-700 mb-1'
                    >
                      Recipient Address
                    </label>
                    <input
                      type='text'
                      id='toAddress'
                      name='toAddress'
                      className='w-full p-2 border border-gray-300 rounded-md'
                      placeholder='0x...'
                      value={transferForm.toAddress}
                      onChange={handleTransferFormChange}
                      required
                    />
                  </div>
                  <button
                    type='submit'
                    className='w-full p-3 bg-primary text-white font-medium rounded-md hover:bg-primary/90 transition-colors flex justify-center items-center'
                    disabled={transferTokenHook.isTransferring}
                  >
                    {transferTokenHook.isTransferring ? (
                      <>
                        <svg
                          className='animate-spin -ml-1 mr-2 h-4 w-4 text-white'
                          xmlns='http://www.w3.org/2000/svg'
                          fill='none'
                          viewBox='0 0 24 24'
                        >
                          <circle
                            className='opacity-25'
                            cx='12'
                            cy='12'
                            r='10'
                            stroke='currentColor'
                            strokeWidth='4'
                          ></circle>
                          <path
                            className='opacity-75'
                            fill='currentColor'
                            d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                          ></path>
                        </svg>
                        Transferring...
                      </>
                    ) : (
                      'Transfer NFT'
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* Owned NFTs display */}
            <h3 className='text-lg font-bold mb-4'>Your NFTs</h3>
            {!address || !isConnected ? (
              <div className='text-center py-10 bg-white rounded-lg'>
                <p className='text-gray-500'>Please connect your wallet to view your NFTs.</p>
              </div>
            ) : loading ? (
              <div
                id='nft-grid'
                className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'
              >
                {[...Array(Math.min(ITEMS_PER_PAGE, 2))].map((_, index) => (
                  <div
                    key={`owned-skeleton-${index}`}
                    className='animate-pulse rounded-xl overflow-hidden bg-white shadow-md'
                  >
                    <div className='bg-gray-200 h-64 w-full'></div>
                    <div className='p-4 space-y-3'>
                      <div className='h-4 bg-gray-200 rounded w-3/4'></div>
                      <div className='h-3 bg-gray-200 rounded w-full'></div>
                      <div className='h-3 bg-gray-200 rounded w-full'></div>
                      <div className='h-3 bg-gray-200 rounded w-2/3'></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : ownedTokens.length === 0 ? (
              <div className='text-center py-10 bg-white rounded-lg'>
                <p className='text-gray-500'>You don't own any NFTs yet.</p>
              </div>
            ) : (
              <>
                <div
                  id='nft-grid'
                  className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'
                >
                  {currentOwnedTokens.map((id) => {
                    const token = tokenMetaData.get(Number(id));
                    return token ? (
                      <NFTCard
                        key={`owned-${id}`}
                        metadata={token}
                        mintPrice={mintPrice}
                        tokenId={Number(id)}
                        nextTokenId={nextTokenId}
                        owned={true}
                      />
                    ) : (
                      <div
                        key={`loading-${id}`}
                        className='w-full h-64 bg-gray-100 rounded-xl animate-pulse flex items-center justify-center'
                      >
                        <p className='text-gray-400'>Loading Token #{id}...</p>
                      </div>
                    );
                  })}
                </div>

                {/* Owned NFTs Pagination */}
                {renderPaginationControls(totalOwnedPages, ownedCurrentPage, true)}
              </>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default App;
