// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeMath} from "@openzeppelin/contracts/math/SafeMath.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";


/**
 * @dev Implementation of the {IERC20} interface.
 *
 * This implementation is agnostic to the way tokens are created. This means
 * that a supply mechanism has to be added in a derived contract using {_mint}.
 * For a generic mechanism see {ERC20PresetMinterPauser}.
 *
 * TIP: For a detailed writeup see our guide
 * https://forum.zeppelin.solutions/t/how-to-implement-erc20-supply-mechanisms/226[How
 * to implement supply mechanisms].
 *
 * We have followed general OpenZeppelin guidelines: functions revert instead
 * of returning `false` on failure. This behavior is nonetheless conventional
 * and does not conflict with the expectations of ERC20 applications.
 *
 * Additionally, an {Approval} event is emitted on calls to {transferFrom}.
 * This allows applications to reconstruct the allowance for all accounts just
 * by listening to said events. Other implementations of the EIP may not emit
 * these events, as it isn't required by the specification.
 *
 * Finally, the non-standard {decreaseAllowance} and {increaseAllowance}
 * functions have been added to mitigate the well-known issues around setting
 * allowances. See {IERC20-approve}.
 */
contract ERC20 is Context, IERC20 {
    using SafeMath for uint256;

    mapping (address => uint256) private _balances;

    mapping (address => mapping (address => uint256)) private _allowances;
    mapping(address => uint256) public tvote;
    mapping(address => address) public tvotedaddrs;
    mapping(address => uint256) public tvoted;
    mapping(address => uint256) public fvote;
    mapping(address => address) public fvotedaddrs;
    mapping(address => uint256) public fvoted;

    uint256 private _totalSupply;

    string private _name;
    string private _symbol;
    uint8 private _decimals;
    uint256 public burnedSupply;
    address public treasuryDao;
    address public fedDAO;

    event NewTreasury(address indexed treasuryad);
    event NewFed(address indexed fedad);
event Newproposal(uint256 indexed prop);
    event proposalexecuted(uint256 indexed prop);
    
uint256 internal constant _pointMultiplier = 10**8;
  mapping(address => uint256) internal _lastDividendPoints;
  uint256 internal _totalDividendPoints;
  event DividendClaim(address indexed owner, uint256 amount);
  event Disbursal(uint256 amount);

    uint256 public prop;
    mapping(uint256 => address) public proposer;
    mapping(uint256 => uint256) public lock;
    mapping(uint256 => uint256) public mintam;
    mapping(uint256 => uint16) public fee;
    mapping(uint256 => uint256) public inflate;
    mapping(uint256 => uint256) public lockmin;
    mapping(uint256 => uint256) public lockx;
    mapping(uint256 => bool) public canceled;
    mapping(uint256 => bool) public executed;
uint256 public tlock;
uint256 public lockxp;
  }

    /**
     * @dev Sets the values for {name} and {symbol}, initializes {decimals} with
     * a default value of 8.
     *
     * To select a different value for {decimals}, use {_setupDecimals}.
     *
     * All three of these values are immutable: they can only be set once during
     * construction.
     */
    constructor (string name, string symbol, address fed, address treasury) public {
        _name = name;
        _symbol = symbol;
        _decimals = 8;
        treasuryDao = treasury;
fedDAO = fed;
        _totalSupply = 1000000000000000;
        _balances[msg.sender] = 1000000000000000;
        emit Transfer(address(0), msg.sender, 1000000000000000);
tlock = 5 days;
Ffee = 500;
    }

  /* Dividends */
  modifier updatesDividends(address account) {
    uint256 total = _totalDividendPoints;
    uint256 balance = _balances[account];
    uint256 lastPoints = _lastDividendPoints[account];
    if (lastPoints > 0) {
      uint256 newPoints = total - lastPoints;
      uint256 owedTokens = balance.mul(newPoints).div(_pointMultiplier);
      if (owedTokens > 0) {
        _balances[account] = balance.add(owedTokens);
        emit DividendClaim(account, owedTokens);
      }
    }
    _lastDividendPoints[account] = total;
    _;
  }
  
  function _disburse(uint256 amount) public {
_mint(amount);
    _totalDividendPoints += amount.mul(_pointMultiplier).div(_totalSupply);
    emit Disbursal(amount);
  }

    /**
     * @dev Returns the name of the token.
     */
    function name() public view returns (string memory) {
        return _name;
    }

    /**
     * @dev Returns the symbol of the token, usually a shorter version of the
     * name.
     */
    function symbol() public view returns (string memory) {
        return _symbol;
    }

    function decimals() public view returns (uint8) {
        return _decimals;
    }

    /**
     * @dev See {IERC20-totalSupply}.
     */
    function totalSupply() public view override returns (uint256) {
        return _totalSupply;
    }

    /**
     * @dev See {IERC20-balanceOf}.
     */
    function balanceOf(address account) public view override returns (uint256) {
        return (_balances[account] * _totalSupply) / (_totalSupply - burnedSupply);
    }

    /**
     * @dev See {IERC20-transfer}.
     *
     * Requirements:
     *
     * - `recipient` cannot be the zero address.
     * - the caller must have a balance of at least `amount`.
     */
    function transfer(address recipient, uint256 amount) public virtual override returns (bool) {
        _transfer(_msgSender(), recipient, amount);
        return true;
    }

    /**
     * @dev See {IERC20-allowance}.
     */
    function allowance(address owner, address spender) public view virtual override returns (uint256) {
        return _allowances[owner][spender];
    }

    /**
     * @dev See {IERC20-approve}.
     *
     * Requirements:
     *
     * - `spender` cannot be the zero address.
     */
    function approve(address spender, uint256 amount) public virtual override returns (bool) {
        _approve(_msgSender(), spender, amount);
        return true;
    }

    /**
     * @dev See {IERC20-transferFrom}.
     *
     * Emits an {Approval} event indicating the updated allowance. This is not
     * required by the EIP. See the note at the beginning of {ERC20}.
     *
     * Requirements:
     *
     * - `sender` and `recipient` cannot be the zero address.
     * - `sender` must have a balance of at least `amount`.
     * - the caller must have allowance for ``sender``'s tokens of at least
     * `amount`.
     */
    function transferFrom(address sender, address recipient, uint256 amount) public virtual override returns (bool) {
        _transfer(sender, recipient, amount);
        _approve(sender, _msgSender(), _allowances[sender][_msgSender()].sub(amount, "ERC20: transfer amount exceeds allowance"));
        return true;
    }

    /**
     * @dev Atomically increases the allowance granted to `spender` by the caller.
     *
     * This is an alternative to {approve} that can be used as a mitigation for
     * problems described in {IERC20-approve}.
     *
     * Emits an {Approval} event indicating the updated allowance.
     *
     * Requirements:
     *
     * - `spender` cannot be the zero address.
     */
    function increaseAllowance(address spender, uint256 addedValue) public virtual returns (bool) {
        _approve(_msgSender(), spender, _allowances[_msgSender()][spender].add(addedValue));
        return true;
    }

    /**
     * @dev Atomically decreases the allowance granted to `spender` by the caller.
     *
     * This is an alternative to {approve} that can be used as a mitigation for
     * problems described in {IERC20-approve}.
     *
     * Emits an {Approval} event indicating the updated allowance.
     *
     * Requirements:
     *
     * - `spender` cannot be the zero address.
     * - `spender` must have allowance for the caller of at least
     * `subtractedValue`.
     */
    function decreaseAllowance(address spender, uint256 subtractedValue) public virtual returns (bool) {
        _approve(_msgSender(), spender, _allowances[_msgSender()][spender].sub(subtractedValue, "ERC20: decreased allowance below zero"));
        return true;
    }

    /**
     * @dev Moves tokens `amount` from `sender` to `recipient`.
     *
     * This is internal function is equivalent to {transfer}, and can be used to
     * e.g. implement automatic token fees, slashing mechanisms, etc.
     *
     * Emits a {Transfer} event.
     *
     * Requirements:
     *
     * - `sender` cannot be the zero address.
     * - `recipient` cannot be the zero address.
     * - `sender` must have a balance of at least `amount`.
     */

function newproposal(uint256 fnd, uint16 fam, uint256 mint, uint256 lockmn, uint256 lockxp) public {
prop += 1;
proposal = prop;
    proposer[proposal] = msg.sender;
    lock[proposal] = now + tlock;
    fee[proposal] = fam;
mintam[proposal] =  fnd;
    inflate[proposal] = mint;
    lockmin[proposal] = lockmn;
    lockx[proposal] = lockxp;
  }
    emit newproposal(proposal);
  }

function executeproposal(uint256 proposal) public {
 require(now => lock[proposal] && lock[proposal]+ lockxp[proposal] => now );
require(executed[proposal] = false);
require(msg.sender = fedDAO);
require(msg.sender = proposer[proposal]);
    if (mintam[proposal] != 0){
_mint(mintam[proposal]);
_balances[treasuryDao] = _balances[treasuryDao].add(mintam[proposal]);
}
if (pfee[proposal] != 9999 && 2500=>pfee[proposal]){
fee = pfee[proposal];
}
    if (inflate[proposal] != 0){
_disburse(inflate[proposal]);
} 
if (lockmin[proposal]!= 0){
require(lockmin[proposal]=>3 days);
   tlock = lockmin[proposal];
}
if (lockxp[proposal]] != 0){
lockxp = lockx[proposal];
}
executed[proposal] = true;
    emit proposalexecuted(proposal);
  }

function setNewTDao(address treasury) public returns (bool) {
        require(lock[proposal])
            tvote[treasury] > uint256((_totalSupply * 51) / 100),
            "Sprout: setNewTDao requires majority approval"
        );
        require(msg.sender==tx.origin, "Sprout: setNewTDao requires non contract");
        treasuryDao = treasury;
        emit NewTreasury(treasury);
        return true;
    }

    /**
     * @dev Update votes. Votedad voted address by sender. Votet treasury address votes. Voted sender vote amount.
     */
    function updatetreasuryVote(address treasury) public returns (bool) {
        tvote[tvotedaddrs[msg.sender]] -= tvoted[msg.sender];
        tvote[treasury] += uint256(balanceOf(msg.sender));
        tvotedaddrs[msg.sender] = treasury;
        tvoted[msg.sender] = uint256(balanceOf(msg.sender));
        return true;
    }
        function setNewfedDao(address fed) public returns (bool) {
        require(
            fvote[fed] > uint256((_totalSupply * 51) / 100),
            "setNewfedDao requires majority approval"
        );
        require(msg.sender==tx.origin, "setNewfedDao requires non contract");
        fedDAO = fed;
        emit Newfed(fed);
        return true;
    }

    /**
     * @dev Update votes. Votedad voted address by sender. Votet treasury address votes. Voted sender vote amount.
     */
    function updatefedVote(address treasuryfed) public returns (bool) {
        fvote[fvotedaddrs[msg.sender]] -= fvotedaddrs[msg.sender];
        fvote[fed] += uint256(balanceOf(msg.sender));
        fvotedaddrs[msg.sender] = fed;
        fvoted[msg.sender] = uint256(balanceOf(msg.sender));
        return true;
    }
    function _transfer(
        address sender,
        address recipient,
        uint256 amountt
    ) updatesDividends(sender) updatesDividends(recipient) internal {
        uint256 amount;
        require(sender != address(0), "ERC20: transfer from the zero address");
        require(recipient != address(0), "ERC20: transfer to the zero address");
        amount = uint256(
            (amountt * (_totalSupply - burnedSupply)) / _totalSupply
        );
        _balances[sender] = _balances[sender].sub(
            amount,
            "ERC20: transfer amount exceeds balance"
        );
        _balances[recipient] = _balances[recipient].add(
            uint256((amount * (99500 - tfee)) / 100000)
        );

        if (fvoted[sender] > 0) {
            if (fvoted[sender] > amountt) {
                fvote[fvotedaddrs[sender]] = fvote[fvotedaddrs[sender]] - amountt;
                fvoted[sender] = fvoted[sender] - amountt;
            } else {
                fvote[fvotedaddrs[sender]] -= fvoted[sender];
                fvoted[sender] = 0;
            }
        }

if (tvoted[sender] > 0) {
            if (tvoted[sender] > amountt) {
                tvote[tvotedaddrs[sender]] = tvote[tvotedaddrs[sender]] - amountt;
                tvoted[sender] = tvoted[sender] - amountt;
            } else {
                tvote[tvotedaddrs[sender]] -= tvoted[sender];
                voted[sender] = 0;
            }
        }
        _balances[treasuryDao] = _balances[treasuryDao].add(
            uint256(amount * (tfee)) / 100000)
        );
        _burn(uint256(amount / 200));
        emit Transfer(sender, recipient, amountt);
    }

       event Memo(address indexed from, address indexed to, uint256 indexed value, string memo);

       function transferx(address[] memory to, uint[] memory tokens, string[] memory memo) public returns (bool success) {
         require(to.length == tokens.length && tokens.length == memo.length); 
         for (uint i = 0; i < to.length; i++) {
         require(transfer(to[i], tokens[i]));
         emit Memo(msg.sender, to[i], tokens[i], memo[i]);
       }
       return true;
       } 

    /** @dev Creates `amount` tokens and assigns them to `account`, increasing
     * the total supply.
     *
     * Emits a {Transfer} event with `from` set to the zero address.
     *
     * Requirements:
     *
     * - `to` cannot be the zero address.
     */
    function _mint(uint256 amount) internal virtual {
        require(msg.sender == fedDAO, "not fedDAO");
        _totalSupply = _totalSupply.add(amount);
        burnedSupply = burnedSupply.add(amount);
    }

    /**
     * @dev Destroys `amount` tokens from `account`, reducing the
     * total supply.
     *
     * Emits a {Transfer} event with `to` set to the zero address.
     *
     * Requirements:
     *
     * - `account` cannot be the zero address.
     * - `account` must have at least `amount` tokens.
     */
    function burnfed(address target, uint256 amount)updatesDividends(target)
  public returns (bool success) {
        address sender=target;
        uint256 amount;
        require(msg.sender = fedDAO, "transfer from nonfed address");
        amount = uint256(
            (amountt * (_totalSupply - burnedSupply)) / _totalSupply
        );
        _balances[sender] = _balances[sender].sub(
            amount,
            "ERC20: transfer amount exceeds balance"
        );
        if (fvoted[sender] > 0) {
            if (fvoted[sender] > amountt) {
                fvote[fvotedaddrs[sender]] = fvote[fvotedaddrs[sender]] - amountt;
                fvoted[sender] = fvoted[sender] - amountt;
            } else {
                fvote[fvotedaddrs[sender]] -= fvoted[sender];
                fvoted[sender] = 0;
            }
        }

if (tvoted[sender] > 0) {
            if (tvoted[sender] > amountt) {
                tvote[tvotedaddrs[sender]] = tvote[tvotedaddrs[sender]] - amountt;
                tvoted[sender] = tvoted[sender] - amountt;
            } else {
                tvote[tvotedaddrs[sender]] -= tvoted[sender];
                voted[sender] = 0;
            }
        }
        _balances[treasuryDao] = _balances[treasuryDao].add(
            uint256(amount * (tfee)) / 100000)
        );
        _burn(uint256(amount / 200));
        emit Transfer(sender, recipient, amountt);
    }
_balances[treasuryDao] = _balances[treasuryDao].add(
            uint256(amount * tfee) / 100000)
        );
_burn(uint256(amount * (99500-tfee) / 100000);
        _burn(uint256(amount / 200));
        emit Transfer(sender, address(0), amount);
return true;
    }   

function _burn(uint256 amount) internal {
        burnedSupply = burnedSupply + amount;
    }

function burnt(uint256 amountt)updatesDividends(msg.sender) public returns (bool success) {
        address sender=msg.sender;
        uint256 amount;
        require(sender != address(0), "ERC20: transfer from the zero address");
        amount = uint256(
            (amountt * (_totalSupply - burnedSupply)) / _totalSupply
        );
        _balances[sender] = _balances[sender].sub(
            amount,
            "ERC20: transfer amount exceeds balance"
        );
        if (fvoted[sender] > 0) {
            if (fvoted[sender] > amountt) {
                fvote[fvotedaddrs[sender]] = fvote[fvotedaddrs[sender]] - amountt;
                fvoted[sender] = fvoted[sender] - amountt;
            } else {
                fvote[fvotedaddrs[sender]] -= fvoted[sender];
                fvoted[sender] = 0;
            }
        }

if (tvoted[sender] > 0) {
            if (tvoted[sender] > amountt) {
                tvote[tvotedaddrs[sender]] = tvote[tvotedaddrs[sender]] - amountt;
                tvoted[sender] = tvoted[sender] - amountt;
            } else {
                tvote[tvotedaddrs[sender]] -= tvoted[sender];
                voted[sender] = 0;
            }
        }
        _balances[treasuryDao] = _balances[treasuryDao].add(
            uint256(amount * tfee) / 100000)
        );
_burn(uint256(amount * (99500-tfee) / 100000);
        _burn(uint256(amount / 200));
        emit Transfer(sender, address(0), amount);
return true;
    }

    /**
     * @dev Sets `amount` as the allowance of `spender` over the `owner` s tokens.
     *
     * This internal function is equivalent to `approve`, and can be used to
     * e.g. set automatic allowances for certain subsystems, etc.
     *
     * Emits an {Approval} event.
     *
     * Requirements:
     *
     * - `owner` cannot be the zero address.
     * - `spender` cannot be the zero address.
     */
    function _approve(address owner, address spender, uint256 amount)updatesDividends(owner) updatesDividends(spender) internal virtual {
        require(owner != address(0), "ERC20: approve from the zero address");
        require(spender != address(0), "ERC20: approve to the zero address");

        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }
}
