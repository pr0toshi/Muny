// imports
const { expect } = require("chai");
const { waffle } = require("hardhat");
const { deployContract, solidity  } = waffle;
const provider = waffle.provider;

const zeroaddress = "0x0000000000000000000000000000000000000000";
//const deployer = "0x9D31e30003f253563Ff108BC60B16Fdf2c93abb5";

// test suite for the basic constructor of Muny
describe("Muny Constructor", function() {
	
  // variable to store the deployed smart contract	
  let muny;	
  let owner, addr1, addr2, addr3, addr4;
	
  // initial deployment of Muny.sol	
  before(async function() {
    const Muny = await ethers.getContractFactory("Muny");
	[owner, addr1, addr2, addr3, addr4] = await ethers.getSigners(); 
    muny = await Muny.deploy("Muny","MUNY",addr1.address,addr2.address);
	await muny.deployed();
  })	
	
  it("Should return the right name", async function() {
    expect(await muny.name()).to.equal("Muny");
  });

  it("Should return the right symbol", async function() {
    expect(await muny.symbol()).to.equal("MUNY");
  });

  it("Should return the right decimals", async function() {
    expect(await muny.decimals()).to.equal(8);
  });
 
  it("Should return the right total supply", async function() {
    expect(await muny.totalSupply()).to.equal("1000000000000000"); // 10**7**8
  });

  it("Should return the right treasury", async function() {
    expect(await muny.treasuryDao()).to.equal(addr2.address);
  });

  it("Should return the right fed", async function() {
    expect(await muny.fedDAO()).to.equal(addr1.address);
  });

  it("Should have the right fed balance initial", async function() {
    expect(await muny.balanceOf(addr2.address)).to.equal("1000000000000000"); // 10**7**8
  });

  it("Should have the right tlock", async function() {
    expect(await muny.tlock()).to.equal(900);
  });
  
  it("Should have the right lockxp ", async function() {
    expect(await muny.lockxp()).to.equal(1209600); // 1 day
  });
 
  it("Should have the right fee ", async function() {
    expect(await muny.fee()).to.equal(500);
  }); 
 
  it("Should have the right total disbursals", async function() {
    expect(await muny.totalDisbursals()).to.equal(0);
  });  

  it("Should have the right burned supply", async function() {
    expect(await muny.burnedSupply()).to.equal(0);
  });    

  it("Should have the right prop number", async function() {
    expect(await muny.prop()).to.equal(0);
  }); 
 
});

// test suite for allowance
describe("Allowance Functions", function() {
	
  // variable to store the deployed smart contract	
  let muny;	
  let owner, addr1, addr2, addr3, addr4;
	
  // initial deployment of Muny.sol	
  before(async function() {
    const Muny = await ethers.getContractFactory("Muny");
	[owner, addr1, addr2, addr3, addr4] = await ethers.getSigners(); 
    muny = await Muny.deploy("Muny","MUNY",addr1.address,addr2.address);
	await muny.deployed();
  })
	
  it("Should return allowance of 0 initial", async function() {
    expect(await muny.allowance(owner.address,muny.address)).to.equal("0");
  });
  
  it("Should increase the allowance by 1000", async function() {
    await muny.increaseAllowance(muny.address,1000);
	expect(await muny.allowance(owner.address,muny.address)).to.equal("1000");
  });  
 
  it("Should decrease increase the allowance by 1000", async function() {
	expect(await muny.allowance(owner.address,muny.address)).to.equal("1000");
    await muny.decreaseAllowance(muny.address,1000);
	expect(await muny.allowance(owner.address,muny.address)).to.equal("0");
  }); 
  
  it("Should not decrease below zero", async function() {
	await expect(muny.decreaseAllowance(zeroaddress,10000)).to.be.revertedWith('ERC20: decreased allowance below zero');
  });   

  it("Should approve 1000", async function() {
    await muny.approve(muny.address,1000);
	expect(await muny.allowance(owner.address,muny.address)).to.equal("1000");
  });    
 
  it("Should approve 0", async function() {
	expect(await muny.allowance(owner.address,muny.address)).to.equal("1000");
    await muny.approve(muny.address,0);
	expect(await muny.allowance(owner.address,muny.address)).to.equal("0");
  });  
 
  it("Should not approve zero address spender", async function() {
    await expect(muny.approve(zeroaddress,0)).to.be.revertedWith('ERC20: approve to the zero address');
	await expect(muny.increaseAllowance(zeroaddress,1000)).to.be.revertedWith('ERC20: approve to the zero address');
	await expect(muny.decreaseAllowance(zeroaddress,0)).to.be.revertedWith('ERC20: approve to the zero address');
  });  
 
  it("Should not approve zero address owner", async function() {
    await expect(muny.approve(zeroaddress,0)).to.be.revertedWith('ERC20: approve to the zero address');
  });  
 
});

// burn test
describe("Muny Burn Function", function() {
	
  // variable to store the deployed smart contract	
  let muny;	
  let owner, addr1, addr2, addr3, addr4;
	
  // initial deployment of Muny.sol	
  before(async function() {
    const Muny = await ethers.getContractFactory("Muny");
	[owner, addr1, addr2, addr3, addr4] = await ethers.getSigners(); 
    muny = await Muny.deploy("Muny","MUNY",addr1.address,addr2.address);
	await muny.deployed();
  })	
		
  it("Should not be allowed with more than available amount", async function() {
	await expect(muny.burnt("10000000000000000000000001")).to.be.revertedWith('ERC20: transfer amount exceeds balance');
  });

  it("Should increase burend supply by 1000 *99/100 + 1000/200 = 995", async function() {
	await muny.connect(addr2).burnt("1000");
	expect(await muny.burnedSupply()).to.equal("995");
  });     
 
});

// test suite for treasury functions
describe("Treasury Functions", function() {
	
  // variable to store the deployed smart contract	
  let muny;	
  let owner, addr1, addr2, addr3, addr4;
	
  // initial deployment of Muny.sol	
  before(async function() {
    const Muny = await ethers.getContractFactory("Muny");
	[owner, addr1, addr2, addr3, addr4] = await ethers.getSigners(); 
    muny = await Muny.deploy("Muny","MUNY",addr1.address,addr2.address);
	await muny.deployed();
  })
	
  it("Should not update treasury", async function() {
	await expect(muny.setNewTDao(owner.address)).to.be.revertedWith("Sprout: setNewTDao requires majority approval");
  });

  it("Should be able to set new treasury", async function() {
	await expect(muny.connect(addr2).setNewTDao(owner.address)).to.be.revertedWith("Sprout: setNewTDao requires majority approval");
	await muny.connect(addr2).updatetreasuryVote(owner.address);
	await muny.connect(addr2).setNewTDao(owner.address);
	expect(await muny.treasuryDao()).to.equal(owner.address);

	
  });
});

// test suite for fed functions
describe("Fed Functions", function() {
	
  // variable to store the deployed smart contract	
  let muny;	
  let owner, addr1, addr2, addr3, addr4;
	
  // initial deployment of Muny.sol	
  before(async function() {
    const Muny = await ethers.getContractFactory("Muny");
	[owner, addr1, addr2, addr3, addr4] = await ethers.getSigners(); 
    muny = await Muny.deploy("Muny","MUNY",addr1.address,addr2.address);
	await muny.deployed();
  })
	
  it("Should not update treasury", async function() {
	await expect(muny.setNewfedDao(owner.address)).to.be.revertedWith("setNewfedDao requires majority approval");
  });


  it("Should be able to set new fed", async function() {
	await expect(muny.connect(addr2).setNewTDao(owner.address)).to.be.revertedWith("Sprout: setNewTDao requires majority approval");
	await muny.connect(addr2).updatefedVote(owner.address);
	await muny.connect(addr2).setNewfedDao(owner.address);
	expect(await muny.fedDAO()).to.equal(owner.address);

	
  });
});

// freeze functions
describe("Freeze Functions", function() {
	
  // variable to store the deployed smart contract	
  let muny;	
  let owner, addr1, addr2, addr3, addr4;
	
  // initial deployment of Muny.sol	
  before(async function() {
    const Muny = await ethers.getContractFactory("Muny");
	[owner, addr1, addr2, addr3, addr4] = await ethers.getSigners(); 
    muny = await Muny.deploy("Muny","MUNY",addr1.address,addr2.address);
	await muny.deployed();
  })
	
  it("Should not be called by non fed treasury", async function() {
	await expect(muny.freeze(addr3.address)).to.be.reverted;
  });

  it("Should not be called by non fed treasury unfreeze", async function() {
	await expect(muny.unfreeze(addr3.address)).to.be.reverted;
  });

  it("Should be able to freeze and unfreeze an account", async function() {
	await muny.connect(addr1).freeze(addr3.address);
	expect(await muny.Frozen(addr3.address)).to.be.true;
	await muny.connect(addr1).unfreeze(addr3.address);
	expect(await muny.Frozen(addr3.address)).to.be.false;
  });

  it("Should be able to send with frozen account", async function() {
	await muny.connect(addr1).freeze(addr3.address);
	await expect(muny.connect(addr3).transfer(addr1.address,0)).to.be.reverted;

  });
  
});

// transfering
describe("Transfering of tokens", function() {
	
  // variable to store the deployed smart contract	
  let muny;	
  let owner, addr1, addr2, addr3, addr4;
	
  // initial deployment of Muny.sol	
  before(async function() {
    const Muny = await ethers.getContractFactory("Muny");
	[owner, addr1, addr2, addr3, addr4] = await ethers.getSigners(); 
    muny = await Muny.deploy("Muny","MUNY",addr1.address,addr2.address);
	await muny.deployed();
  })	
		
  it("Should not be allowed with exceeding tokens", async function() {
	await expect(muny.transferFrom(addr2.address, addr1.address,"10000000000000000000000001")).to.be.revertedWith('ERC20: transfer amount exceeds balance');
  }); 
   
  it("Should not be allowed with transfer from zero", async function() {
	await expect(muny.transferFrom(zeroaddress, addr2.address,1000)).to.be.revertedWith('ERC20: transfer from the zero address');
  });    
 
  it("Should not be allowed with transfer to zero", async function() {
	await expect(muny.transferFrom(addr2.address, zeroaddress,1000)).to.be.revertedWith('ERC20: transfer to the zero address');
  });   
 
  it("Should transfer the funds correctly", async function() {
	let treasurydao = await muny.treasuryDao();
	expect(await muny.balanceOf(owner.address)).to.equal("0");
	expect(await muny.balanceOf(addr1.address)).to.equal("0");
	expect(await muny.balanceOf(treasurydao)).to.equal("1000000000000000");
	
	// set allowance and send
	await muny.connect(addr2).approve(addr2.address,1000);
	await muny.connect(addr2).transferFrom(addr2.address, addr1.address,1000);
	
	expect(await muny.balanceOf(owner.address)).to.equal("0");
	expect(await muny.balanceOf(addr1.address)).to.equal("990");
	expect(await muny.balanceOf(treasurydao)).to.equal("999999999999009");	
  });  
 
});

// transferX
describe("Transfering of tokens X", function() {
	
  // variable to store the deployed smart contract	
  let muny;	
  let owner, addr1, addr2, addr3, addr4;
	
  // initial deployment of Muny.sol	
  before(async function() {
    const Muny = await ethers.getContractFactory("Muny");
	[owner, addr1, addr2, addr3, addr4] = await ethers.getSigners(); 
    muny = await Muny.deploy("Muny","MUNY",addr1.address,addr2.address);
	await muny.deployed();
  })	
		
  it("Should not be allowed to send to zero address", async function() {
	await expect(muny.connect(addr2).transferx([zeroaddress], [1000],["test"])).to.be.revertedWith('ERC20: transfer to the zero address');
  }); 
    
  it("Should not be allowed to send with too many tokens", async function() {
	await expect(muny.connect(addr2).transferx([addr1.address], ["10000000000000000000000001"],["test"])).to.be.revertedWith('ERC20: transfer amount exceeds balance');
  }); 	
 
  it("Should transfer the funds correctly", async function() {
	let treasurydao = await muny.treasuryDao();
	expect(await muny.balanceOf(owner.address)).to.equal("0");
	expect(await muny.balanceOf(addr1.address)).to.equal("0");
	expect(await muny.balanceOf(treasurydao)).to.equal("1000000000000000");
	
	// set allowance and send
	await muny.connect(addr2).transferx([addr1.address, owner.address], [1000,1000],["test", "test2"]);
	
	expect(await muny.balanceOf(owner.address)).to.equal("989");
	expect(await muny.balanceOf(addr1.address)).to.equal("990");
	expect(await muny.balanceOf(treasurydao)).to.equal("999999999998018");	
  });   
 
});

// proposal functions
describe("Proposal Functions", function() {
	
  // variable to store the deployed smart contract	
  let muny;	
  let owner, addr1, addr2, addr3, addr4;
	
  // initial deployment of Muny.sol	
  before(async function() {
    const Muny = await ethers.getContractFactory("Muny");
	[owner, addr1, addr2, addr3, addr4] = await ethers.getSigners(); 
    muny = await Muny.deploy("Muny","MUNY",addr1.address,addr2.address);
	await muny.deployed();
  })
	
  it("Should be able to create a proposal", async function() {
	expect(await muny.prop()).to.equal(0);
	
	// create dummy proposal
	await expect(muny.newproposal(1,2,3,4,zeroaddress,1,2)).to.emit(muny, "Newproposal");
	expect(await muny.prop()).to.equal(1);
	let proposal = await muny.proposals(1);
	
	//check the created proposal
	
	expect(proposal.proposer).to.equal(owner.address);
    expect(proposal.pfee).to.equal(2);
    expect(proposal.burnaddress).to.equal(zeroaddress);
    expect(proposal.burnamount).to.equal(1);
    expect(proposal.mintam).to.equal(1);
    expect(proposal.inflate).to.equal(3);
    expect(proposal.lockmin).to.equal(4);
    expect(proposal.lockx).to.equal(2);
  });

  it("Should not be called within blocklock time", async function() {
	await expect(muny.executeproposal(1)).to.be.reverted;
	

  });
  it("Should not be called by non fed treasury", async function() {
	//increase time for block lock
	await provider.send("evm_increaseTime", [60*60*24*2])  
	await provider.send("evm_mine")    
	
	await expect(muny.executeproposal(1)).to.be.reverted;
  });

  it("Should not execute proposer is not feddao", async function() {
	await expect(muny.connect(addr1).executeproposal(1)).to.be.reverted;
  });
 
  it("Should be able to create a proposal from fed dao", async function() {
	expect(await muny.prop()).to.equal(1);
	
	// create new dummy proposal
	await expect(muny.connect(addr1).newproposal(1,2,3,4,zeroaddress,1,2)).to.emit(muny, "Newproposal");
	expect(await muny.prop()).to.equal(2);
	let proposal = await muny.proposals(2);
	
	//check the created proposal
	
	expect(proposal.proposer).to.equal(addr1.address);
    expect(proposal.pfee).to.equal(2);
    expect(proposal.burnaddress).to.equal(zeroaddress);
    expect(proposal.burnamount).to.equal(1);
    expect(proposal.mintam).to.equal(1);
    expect(proposal.inflate).to.equal(3);
    expect(proposal.lockmin).to.equal(4);
    expect(proposal.lockx).to.equal(2);
  });

  it("Should not execute because lockmin is below 3 days", async function() {
	  
	await provider.send("evm_increaseTime", [60*60*24*2])  
	await provider.send("evm_mine")     
	await expect(muny.connect(addr1).executeproposal(2)).to.be.reverted;
  });

  it("Should not execute because lockx is below 6 hours", async function() {
	  
	// create new dummy proposal
	await expect(muny.connect(addr1).newproposal(1,2,3,4*60*60*24,zeroaddress,1,2)).to.emit(muny, "Newproposal");
	expect(await muny.prop()).to.equal(3);
	let proposal = await muny.proposals(3);
	
	//check the created proposal
	
	expect(proposal.proposer).to.equal(addr1.address);
    expect(proposal.pfee).to.equal(2);
    expect(proposal.burnaddress).to.equal(zeroaddress);
    expect(proposal.burnamount).to.equal(1);
    expect(proposal.mintam).to.equal(1);
    expect(proposal.inflate).to.equal(3);
    expect(proposal.lockmin).to.equal(4*60*60*24);
    expect(proposal.lockx).to.equal(2);	  
	  
	await provider.send("evm_increaseTime", [60*60*24*2])  
	await provider.send("evm_mine")     
	await expect(muny.connect(addr1).executeproposal(3)).to.be.reverted;
  });

  it("Should execute the proposal with a zero address (no burn)", async function() {
	  
	// create new dummy proposal
	await expect(muny.connect(addr1).newproposal(1,2,3,4*60*60*24,zeroaddress,1,7*60*60)).to.emit(muny, "Newproposal");
	expect(await muny.prop()).to.equal(4);
	let proposal = await muny.proposals(4);
	
	//check the created proposal
	expect(proposal.executed).to.equal(false);
	expect(proposal.proposer).to.equal(addr1.address);
    expect(proposal.pfee).to.equal(2);
    expect(proposal.burnaddress).to.equal(zeroaddress);
    expect(proposal.burnamount).to.equal(1);
    expect(proposal.mintam).to.equal(1);
    expect(proposal.inflate).to.equal(3);
    expect(proposal.lockmin).to.equal(4*60*60*24);
    expect(proposal.lockx).to.equal(7*60*60);	  
	  
	await provider.send("evm_increaseTime", [60*60*24*2])  
	await provider.send("evm_mine")   

	let treasurydao = await muny.treasuryDao();
    let treasury_balance = await muny.balanceOf(treasurydao);
	
	//let totalsupply = await muny.totalSupply();
	//let burnedSupply = await muny.burnedSupply();
	//console.log(totalsupply);
	//console.log(burnedSupply);
	
	// execute proposal
	await muny.connect(addr1).executeproposal(4);
	proposal = await muny.proposals(4);
	
	expect(proposal.executed).to.equal(true);
	expect(await muny.fee()).to.equal(2);
	expect(await muny.lockxp()).to.equal(7*60*60);
	expect(await muny.tlock()).to.equal(4*60*60*24);
	
	//totalsupply = await muny.totalSupply();
	//burnedSupply = await muny.burnedSupply();
	//console.log(totalsupply);
	//console.log(burnedSupply);	
	
	expect(await muny.balanceOf(treasurydao)).to.equal(treasury_balance.add(1));
  });
 
});


// proposal functions
describe("Proposal Functions Burn", function() {
	
  // variable to store the deployed smart contract	
  let muny;	
  let owner, addr1, addr2, addr3, addr4;
	
  // initial deployment of Muny.sol	
  before(async function() {
    const Muny = await ethers.getContractFactory("Muny");
	[owner, addr1, addr2, addr3, addr4] = await ethers.getSigners(); 
    muny = await Muny.deploy("Muny","MUNY",addr1.address,addr2.address);
	await muny.deployed();
  })

  it("Should execute the proposal with a burn", async function() {
	  
	// create new dummy proposal
	await expect(muny.connect(addr1).newproposal(1,2,3,4*60*60*24,addr2.address,1000,7*60*60)).to.emit(muny, "Newproposal");
	expect(await muny.prop()).to.equal(1);
	let proposal = await muny.proposals(1);
	
	//check the created proposal
	expect(proposal.executed).to.equal(false);
	expect(proposal.proposer).to.equal(addr1.address);
    expect(proposal.pfee).to.equal(2);
    expect(proposal.burnaddress).to.equal(addr2.address);
    expect(proposal.burnamount).to.equal(1000);
    expect(proposal.mintam).to.equal(1);
    expect(proposal.inflate).to.equal(3);
    expect(proposal.lockmin).to.equal(4*60*60*24);
    expect(proposal.lockx).to.equal(7*60*60);	  
	  
	await provider.send("evm_increaseTime", [60*60*24*8])  
	await provider.send("evm_mine")   

	let treasurydao = await muny.treasuryDao();
    let treasury_balance = await muny.balanceOf(treasurydao);
	let totalsupply = await muny.totalSupply();
	let burnedSupply = await muny.burnedSupply();
	
	// execute proposal
	await muny.connect(addr1).executeproposal(1);
	proposal = await muny.proposals(1);
	
	expect(proposal.executed).to.equal(true);
	expect(await muny.fee()).to.equal(2);
	expect(await muny.lockxp()).to.equal(7*60*60);
	expect(await muny.tlock()).to.equal(4*60*60*24);
	
	totalsupply = await muny.totalSupply();
	expect(await muny.burnedSupply()).to.equal(burnedSupply.add(1000/200).add(1000*(99500-500)/100000));
	burnedSupply = await muny.burnedSupply();
	
	// we add the amount to treasury, aubstract the burn amount, increase by butn amount * fee / 100000 and interpolate by the balanceof
	expect(await muny.balanceOf(treasurydao)).to.equal((treasury_balance.add(1).sub(1000).add(1000*500/100000)).mul(totalsupply).div(totalsupply.sub(burnedSupply)));
  });  
  
});  
