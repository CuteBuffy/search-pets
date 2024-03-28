import React, { useState, useEffect } from 'react';

export default function Search() {

  // DATA //
  const [textValue, setTextValue] = useState('');
  const [petsApi, setPetsApi] = useState(null)
  const [petsData, setPetsData] = useState(null);
  const [petsRap, setPetsRap] = useState(null);
  const [petsExists, setPetExists] = useState(null)
  const [enchantsData, setEnchantsData] = useState(null)

  // FILTERS //

  const [filter, setFilter] = useState({
    showNormalExclusives: true,
    showGoldenExclusives: false,
    showRainbowExclusives: false,
    showNormalHuges: false,
    showGoldenHuges: false,
    showRainbowHuges: false,
    showEnchants: false,
  })

  const [showFilter, setShowFilter] = useState(false)

  // PAGINATION // 

  const [page, setPage] = useState(1);
  const [maxPerPage, setMaxPerPage] = useState(20);

  const indexOfLastPost = page * maxPerPage
  const indexOfFirstPost = indexOfLastPost - maxPerPage

  const totalPages = (filter.showNormalExclusives || filter.showGoldenExclusives || filter.showRainbowExclusives) ? Math.ceil((petsData?.data.filter(pet => pet.configData.hasOwnProperty("exclusiveLevel")).length || 0) / maxPerPage) : (filter.showNormalHuges || filter.showGoldenHuges || filter.showRainbowHuges) && Math.ceil((petsData?.data.filter(pet => !pet.configName.includes("Evolved") && pet.category === 'Huge').length || 0) / maxPerPage);

  const currentExclusivePosts = petsData && petsData.data.filter(pet => pet.configData.hasOwnProperty("exclusiveLevel"))
    .slice(indexOfFirstPost, indexOfLastPost);

  const currentHugePosts = petsData && petsData.data.filter(pet => !pet.configName.includes("Evolved") && pet.category === 'Huge').slice(indexOfFirstPost, indexOfLastPost)

  const handleNextPage = () => {
    setPage(prevPage => prevPage + 1);
  };

  const handlePrevPage = () => {
    setPage(prevPage => prevPage - 1);
  };

  // CODE //

  const handleTextChange = (e) => {
    const { value } = e.target;
    setTextValue(value);
    const newData = (petsApi) && petsApi.data.filter(pet =>
      value === '' ? true : pet.configName.toLowerCase().includes(value.toLowerCase().trim())
    )
    if (value !== '' && newData.length > maxPerPage) {
      setPage(1);
    }
    setPetsData(prevPetsData => ({
      ...prevPetsData,
      data: newData
    }))
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`https://pets-api-production-4acc.up.railway.app/pets`);
        const data = await res.json();
        setPetsApi(data);
        let petsData = data
        setPetsData(petsData)
      } catch (error) {
        console.error('Error fetching pets data:', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('https://pets-api-production-4acc.up.railway.app/rap');
        const data = await res.json();
        setPetsRap(data);
      } catch (error) {
        console.error('Error fetching rap data:', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('https://pets-api-production-4acc.up.railway.app/exists');
        const data = await res.json();
        setPetExists(data);
      } catch (error) {
        console.error('Error fetching exists data:', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('https://pets-api-production-4acc.up.railway.app/enchants');
        const data = await res.json();
        setEnchantsData(data);
      } catch (error) {
        console.error('Error fetching enchants data:', error);
      }
    };
    fetchData();
  }, []);

  const nFormatter = (num, digits) => {
    const lookup = [
      { value: 1e18, symbol: "E" },
      { value: 1e15, symbol: "P" },
      { value: 1e12, symbol: "T" },
      { value: 1e9, symbol: "B" },
      { value: 1e6, symbol: "M" },
      { value: 1e3, symbol: "k" },
      { value: 1, symbol: "" }
    ];
    const item = lookup.find(item => Math.abs(num) >= item.value);
    if (item) {
      const scaledNum = num / item.value;
      const formattedNum = scaledNum.toFixed(digits);
      return formattedNum.replace(/\.0+$|(\.[0-9]*[1-9])0+$/, "$1") + item.symbol;
    }
    return num.toString();
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target
    setFilter(prevFilter => ({
      ...prevFilter,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleShowFilter = () => {
    setShowFilter(prevShowFilter => !prevShowFilter)
  }

  const normalExclusiveElem = (currentExclusivePosts && petsRap && petsExists) && currentExclusivePosts.map((pet) => {
    if (pet.configData.hasOwnProperty("exclusiveLevel")) {
      const relevantRapData = petsRap.data.find(
        (petRap) =>
          petRap.category === "Pet" && petRap.configData.id === pet.configName &&
          !petRap.configData.hasOwnProperty('pt') &&
          !petRap.configData.hasOwnProperty('sh')
      );
      const findPetExists = petsExists.data.find(
        petExist =>
          petExist.configData.id === pet.configName &&
          !petExist.configData.hasOwnProperty("pt") &&
          !petExist.configData.hasOwnProperty("sh")
      )
      const rapValue = relevantRapData ? relevantRapData.value : 'O/C';
      const petExists = findPetExists ? findPetExists.value : "N/A";
      return (
        <div key={pet.configName} className="pet__container">
          <div className="pet__img-container">
            <img className='pet__img' src={`https://biggamesapi.io/image/${pet.configData.thumbnail.replace(/[^0-9]/g, "")}`} alt={`${pet.configName} image`} />
          </div>
          <div className="rarity__container">
            <p className='pet__rarity normal__rarity'>normal</p>
          </div>
          <h3 className="pet__name">{pet.configName}</h3>
          <div className="pet__info-wrapper">
            <div className="pet__info-container">
              <div className="pet__rap-text-cont">
                <p className='pet__rap-text'>Value</p>
                <div className="live__container">
                  <img className='signal__img' src="./icons/signal.svg" alt="" />
                  <p className='live__text'>live</p>
                </div>
              </div>
              <p className="pet__rap">{nFormatter(rapValue, 1)}</p>
            </div>
            <div className="pet__info-container pet__exists-container">
              <p className='pet__exists-text'>Exists</p>
              <p className='pet__exists-value'>{nFormatter(petExists, 1)}</p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  });

  const goldenExclusiveElem = (currentExclusivePosts && petsRap && petsExists) && currentExclusivePosts.map((pet) => {
    if ((pet.configData.hasOwnProperty("exclusiveLevel"))) {
      const relevantRapData = petsRap.data.find(
        (petRap) =>
          petRap.category === "Pet" && petRap.configData.id === pet.configName && petRap.configData.hasOwnProperty('pt') && petRap.configData.pt === 1 && !petRap.configData.hasOwnProperty("sh")
      );
      const findPetExists = petsExists.data.find(
        petExist =>
          petExist.configData.id === pet.configName &&
          petExist.configData.hasOwnProperty("pt") && petExist.configData.pt === 1 && !petExist.configData.hasOwnProperty("sh")
      )
      const rapValue = relevantRapData ? relevantRapData.value : 'O/C';
      const petExists = findPetExists ? findPetExists.value : "N/A"
      return (
        <div key={pet.configName} className="pet__container">
          <div className="pet__img-container">
            <img className='pet__img' src={pet.configData.goldenThumbnail ? `https://biggamesapi.io/image/${pet.configData.goldenThumbnail.replace(/[^0-9]/g, "")}` : `https://placehold.co/100x100?text=No+Image`} alt={`golden ${pet.configName} image`} />
          </div>
          <div className="rarity__container">
            <p className='pet__rarity golden__rarity'>golden</p>
          </div>
          <h3 className="pet__name">{pet.configName}</h3>
          <div className="pet__info-wrapper">
            <div className="pet__info-container">
              <div className="pet__rap-text-cont">
                <p className='pet__rap-text'>Value</p>
                <div className="live__container">
                  <img className='signal__img' src="./icons/signal.svg" alt="" />
                  <p className='live__text'>live</p>
                </div>
              </div>
              <p className="pet__rap">{nFormatter(rapValue, 1)}</p>
            </div>
            <div className="pet__info-container pet__exists-container">
              <p className='pet__exists-text'>Exists</p>
              <p className='pet__exists-value'>{nFormatter(petExists, 1)}</p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  });

  const rainbowExclusiveElem = (currentExclusivePosts && petsRap && petsExists) && currentExclusivePosts.map(pet => {
    if (pet.configData.hasOwnProperty("exclusiveLevel")) {
      const relevantRapData = petsRap.data.find(
        (petRap) =>
          petRap.configData.id === pet.configName && petRap.configData.pt === 2 && !petRap.configData.hasOwnProperty("sh")
      );
      const findPetExists = petsExists.data.find(
        (petExist) =>
          petExist.configData.id === pet.configName && petExist.configData.pt === 2 && !petExist.configData.hasOwnProperty("sh")
      )
      const rapValue = relevantRapData ? relevantRapData.value : "O/C"
      const petExists = findPetExists ? findPetExists.value : "N/A"
      return (
        <div key={`rainbow ${pet.configName}`} className="pet__container">
          <div className="pet__img-container">
            <img className='pet__img' src={`https://biggamesapi.io/image/${pet.configData.thumbnail.replace(/[^0-9]/g, "")}`} alt={`Rainbow ${pet.configName} image`} />
          </div>
          <div className="rarity__container">
            <p className='pet__rarity rainbow__rarity'>rainbow</p>
          </div>
          <h3 className="pet__name">{pet.configName}</h3>
          <div className="pet__info-wrapper">
            <div className="pet__info-container">
              <div className="pet__rap-text-cont">
                <p className='pet__rap-text'>Value</p>
                <div className="live__container">
                  <img className='signal__img' src="./icons/signal.svg" alt="" />
                  <p className='live__text'>live</p>
                </div>
              </div>
              <p className="pet__rap">{nFormatter(rapValue, 1)}</p>
            </div>
            <div className="pet__info-container pet__exists-container">
              <p className='pet__exists-text'>Exists</p>
              <p className='pet__exists-value'>{nFormatter(petExists, 1)}</p>
            </div>
          </div>
        </div>
      )
    }
    return null;
  })

  const normalHugeElem = (currentHugePosts && petsRap && petsExists) && currentHugePosts.map((pet) => {
    if (!pet.configName.includes("Evolved") && pet.category === 'Huge') {
      const relevantRapData = petsRap.data.find(
        (petRap) =>
          petRap.configData.id === pet.configName &&
          !petRap.configData.hasOwnProperty('pt') &&
          !petRap.configData.hasOwnProperty('sh')
      );
      const findPetExists = petsExists.data.find(
        petExist =>
          petExist.configData.id === pet.configName &&
          !petExist.configData.hasOwnProperty("pt") &&
          !petExist.configData.hasOwnProperty("sh")
      )
      const rapValue = relevantRapData ? relevantRapData.value : 'O/C';
      const petExists = findPetExists ? findPetExists.value : "N/A"
      return (
        <div key={pet.configName} className="pet__container">
          <div className="pet__img-container">
            <img className='pet__img' src={`https://biggamesapi.io/image/${pet.configData.thumbnail.replace(/[^0-9]/g, "")}`} alt={`${pet.configName} image`} />
          </div>
          <div className="rarity__container">
            <p className='pet__rarity normal__rarity'>normal</p>
          </div>
          <h3 className="pet__name">{pet.configName}</h3>
          <div className="pet__info-wrapper">
            <div className="pet__info-container">
              <div className="pet__rap-text-cont">
                <p className='pet__rap-text'>Value</p>
                <div className="live__container">
                  <img className='signal__img' src="./icons/signal.svg" alt="" />
                  <p className='live__text'>live</p>
                </div>
              </div>
              <p className="pet__rap">{nFormatter(rapValue, 1)}</p>
            </div>
            <div className="pet__info-container pet__exists-container">
              <p className='pet__exists-text'>Exists</p>
              <p className='pet__exists-value'>{nFormatter(petExists, 1)}</p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  });

  const goldenHugeElem = (petsRap && currentHugePosts && petsExists) && currentHugePosts.map(pet => {
    if ((pet.category === "Huge" && !pet.configName.includes("Evolved"))) {
      const relevantRapData = petsRap.data.find(
        (petRap) =>
          petRap.configData.id === pet.configName && petRap.configData.pt === 1 && !petRap.configData.hasOwnProperty("sh")
      );
      const findPetExists = petsExists.data.find(
        (petExist) =>
          petExist.configData.id === pet.configName && petExist.configData.pt === 1 && !petExist.configData.hasOwnProperty("sh")
      )
      const rapValue = relevantRapData ? relevantRapData.value : "O/C"
      const petExists = findPetExists ? findPetExists.value : "N/A"
      return (
        <div key={`golden ${pet.configName}`} className="pet__container">
          <div className="pet__img-container">
            <img key={pet.configData.indexDesc} className='pet__img' src={pet.configData.goldenThumbnail ? `https://biggamesapi.io/image/${pet.configData.goldenThumbnail.replace(/[^0-9]/g, "")}` : `https://placehold.co/100x100?text=No+Image`} alt={`Golden ${pet.configName} image`} />
          </div>
          <div className="rarity__container">
            <p className='pet__rarity golden__rarity'>golden</p>
          </div>
          <h3 className="pet__name">{pet.configName}</h3>
          <div className="pet__info-wrapper">
            <div className="pet__info-container">
              <div className="pet__rap-text-cont">
                <p className='pet__rap-text'>Value</p>
                <div className="live__container">
                  <img className='signal__img' src="./icons/signal.svg" alt="" />
                  <p className='live__text'>live</p>
                </div>
              </div>
              <p className="pet__rap">{nFormatter(rapValue, 1)}</p>
            </div>
            <div className="pet__info-container pet__exists-container">
              <p className='pet__exists-text'>Exists</p>
              <p className='pet__exists-value'>{nFormatter(petExists, 1)}</p>
            </div>
          </div>
        </div>
      )
    }
    return null;
  })

  const rainbowHugePetElem = (petsRap && currentHugePosts && petsExists) && currentHugePosts.map(pet => {
    if ((pet.category === "Huge" && !pet.configName.includes("Evolved"))) {
      const relevantRapData = petsRap.data.find(
        (petRap) =>
          petRap.configData.id === pet.configName && petRap.configData.pt === 2 && !petRap.configData.hasOwnProperty("sh")
      );
      const findPetExists = petsExists.data.find(
        (petExist) =>
          petExist.configData.id === pet.configName && petExist.configData.pt === 2 && !petExist.configData.hasOwnProperty("sh")
      )
      const rapValue = relevantRapData ? relevantRapData.value : "O/C"
      const petExists = findPetExists ? findPetExists.value : "N/A"
      return (
        <div key={`rainbow ${pet.configName}`} className="pet__container">
          <div className="pet__img-container">
            <img className='pet__img' src={`https://biggamesapi.io/image/${pet.configData.thumbnail.replace(/[^0-9]/g, "")}`} alt={`Rainbow ${pet.configName} image`} />
            <img className='rainbow__img' src="./imgs/rainbow.png" alt="" />
          </div>
          <div className="rarity__container">
            <p className='pet__rarity rainbow__rarity'>rainbow</p>
          </div>
          <h3 className="pet__name">{pet.configName}</h3>
          <div className="pet__info-wrapper">
            <div className="pet__info-container">
              <div className="pet__rap-text-cont">
                <p className='pet__rap-text'>Value</p>
                <div className="live__container">
                  <img className='signal__img' src="./icons/signal.svg" alt="" />
                  <p className='live__text'>live</p>
                </div>
              </div>
              <p className="pet__rap">{nFormatter(rapValue, 1)}</p>
            </div>
            <div className="pet__info-container pet__exists-container">
              <p className='pet__exists-text'>Exists</p>
              <p className='pet__exists-value'>{nFormatter(petExists, 1)}</p>
            </div>
          </div>
        </div>
      )
    }
    return null;
  })

  const enchantElem = (enchantsData && petsRap) && enchantsData.data.filter((enchant) =>
    textValue === '' ? true : enchant.configData.Tiers[0].DisplayName.toLowerCase().includes(textValue.toLowerCase().trim())
  ).map(enchant => {
    const enchantName = enchant.configData.Tiers[0].DisplayName
    if (enchant.category === "Exclusive") {
      const relevantRapData = petsRap.data.find(petRap =>
        petRap.category === "Enchant" && petRap.configData.id === enchantName
      )
      const rapValue = relevantRapData ? relevantRapData.value : "O/C"
      return (
        <div key={enchantName} className="pet__container">
          <div className="pet__img-container">
            <img draggable='false' className='pet__img' src={`https://biggamesapi.io/image/${enchant.configData.Tiers[0].Icon.replace(/[^0-9]/g, "")}`} alt={`${enchantName} image`} />
          </div>
          <h3 className="pet__name">{enchantName}</h3>
          <div className="pet__info-wrapper">
            <div className="pet__info-container">
              <div className="pet__rap-text-cont">
                <p className='pet__rap-text'>Value</p>
                <div className="live__container">
                  <img className='signal__img' src="./icons/signal.svg" alt="" />
                  <p className='live__text'>live</p>
                </div>
              </div>
              <p className="pet__rap">{nFormatter(rapValue, 1)}</p>
            </div>
            <div className="pet__info-container">
              <div className="pet__rap-text-cont">
                <p className='pet__rap-text'>Demand</p>
              </div>
              <p className={`pet__rap ${rapValue < 25000000 ? "bad__demand" : (rapValue > 25000000 && rapValue < 75000000) ? "mid__demand" : "good__demand"}`}>5/10</p>
            </div>
          </div>
        </div>
      )
    }
    return null;
  })

  return (
    <>
      <div className="search__title-container">
        <h1 className='search__title'></h1>
      </div>
      <div className="search__wrapper">
        <div className="input__container">
          <input
            onChange={handleTextChange}
            value={textValue}
            className="search__input"
            placeholder="Search For Pet"
          />
          <button onClick={handleShowFilter} className="search__btn">
            <p className='filter__title'>Filters</p>
            <img className="search__img" src="./icons/filter.svg" alt="" />
          </button>
        </div>
        {showFilter && <div className="filter__buttons-container">
          <div className="filter__choice-container">
            <input
              className='filter__input'
              type='checkbox'
              id='showNormalExclusives'
              name='showNormalExclusives'
              onChange={handleFilterChange}
              checked={filter.showNormalExclusives}
            />
            <label className='filter__label' htmlFor="showNormalExclusives">Normal Exclusives</label>
          </div>
          <div className="filter__choice-container">
            <input
              className='filter__input'
              type='checkbox'
              id='showGoldenExclusives'
              name='showGoldenExclusives'
              onChange={handleFilterChange}
              checked={filter.showGoldenExclusives}
            />
            <label className='filter__label' htmlFor="showGoldenExclusives">Golden Exclusives</label>
          </div>
          <div className="filter__choice-container">
            <input
              className='filter__input'
              type='checkbox'
              id='showRainbowExclusives'
              name='showRainbowExclusives'
              onChange={handleFilterChange}
              checked={filter.showRainbowExclusives}
            />
            <label className='filter__label' htmlFor="showRainbowExclusives">Rainbow Exclusives</label>
          </div>
          <div className="filter__choice-container">
            <input
              className='filter__input'
              type='checkbox'
              id='showNormalHuges'
              name='showNormalHuges'
              onChange={handleFilterChange}
              checked={filter.showNormalHuges}
            />
            <label className='filter__label' htmlFor="showNormalHuges">Normal Huges</label>
          </div>
          <div className="filter__choice-container">
            <input
              className='filter__input'
              type='checkbox'
              id='showGoldenHuges'
              name='showGoldenHuges'
              onChange={handleFilterChange}
              checked={filter.showGoldenHuges}
            />
            <label className='filter__label' htmlFor="showGoldenHuges">Golden Huges</label>
          </div>
          <div className="filter__choice-container">
            <input
              className='filter__input'
              type='checkbox'
              id='showRainbowHuges'
              name='showRainbowHuges'
              onChange={handleFilterChange}
              checked={filter.showRainbowHuges}
            />
            <label className='filter__label' htmlFor="showRainbowHuges">Rainbow Huges</label>
          </div>
          <div className="filter__choice-container">
            <input
              className='filter__input'
              type='checkbox'
              id='showEnchants'
              name='showEnchants'
              onChange={handleFilterChange}
              checked={filter.showEnchants}
            />
            <label className='filter__label' htmlFor="showEnchants">Enchants</label>
          </div>
        </div>}
      </div>
      <>
        {(petsData && petsRap && enchantsData) ? (
          <>
            <div className="pets__container">
              {(filter.showNormalExclusives) && normalExclusiveElem}
              {(filter.showGoldenExclusives) && goldenExclusiveElem}
              {(filter.showRainbowExclusives) && rainbowExclusiveElem}
              {(filter.showNormalHuges) && normalHugeElem}
              {(filter.showGoldenHuges) && goldenHugeElem}
              {(filter.showRainbowHuges) && rainbowHugePetElem}
              {(filter.showEnchants) && enchantElem}
            </div>
            {totalPages && <div className="pagination__container">
              <button className='pagination__btn' onClick={handlePrevPage} disabled={page === 1}>Previous</button>
              <span className='pagination__text'>{page} of {totalPages}</span>
              <button className='pagination__btn' onClick={handleNextPage} disabled={page === totalPages}>Next</button>
            </div>}
          </>
        ) : <p className="loading__text">Loading...</p>}
      </>
    </>
  );
}