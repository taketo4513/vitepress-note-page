# 账户体系

## 账户体系

账户体系是`EOS`中的亮点之一，实现了基于角色的权限管理和账户恢复功能 ，使得用户可以灵活地以一种组织化的方式管理账户 ，并最大化保证资产的安全性。

### 基于角色的多层级账户体系

常见区块链项目的账户是一对公私钥，账户名就是公钥，而`EOS`中的账户名是由用户**自定义的12位可读标识符**组成，且一般一个账户下面包含多对公私钥，每对可以自定义拥有不同的权限。通过权限配置可实现该账户只被个体拥有或者被一个组织控制（即多个个体共同拥有），该账户是传统公钥所代表的单一权限的更高层次抽象集合。

对于常见的区块链项目而言，一般由于只有一对公私钥，因此项目的代币会直接放在公钥里，如果私钥被盗取代币便可直接转走。而在`EOS`中，**代币是放在账户里的，公钥里面放的是带权重的钥匙，转走账户里面的代币需要每个拥有转账权限的钥匙的权重之和达到设定的阈值才可进行**。`EOS`上的所有交易行为都是通过账户来完成的，通过账户执行任意操作时，`EOS`系统首先会验证操作者是否拥有足够的权限，验证通过该操作才能生效。

`EOS`中，每个账户刚创建时一般由个体拥有，通过单一公私钥便能进行所有操作，后续可根据需要通过权限配置将该账户扩展成组织账户，由多对公私钥（即多个主体)共同控制，甚至可为组织外部个体或组织分配部分操作权限，从而实现极其灵活的组织管理方式。

### 账户权限管理

`EOS`中任意账户都自带两个原生权限：`owner`和`active`权限。`owner`即代表账户所有权，该权限可进行所有操作，包括更改`owner`权限，**可由一对或多对EOS公私钥或另一账户的某权限实现权限控制**。因此，代表着`owner`权限的`EOS`公私钥是最重要的，必须冷储藏（指将钱包进行离线保存的一种方法）。`active`即活跃权限，能进行除更改`owner`权限以外的所有操作，**也是通过一对或多对EOS公私钥或另一账户的某权限实现权限控制的**。

**EOS支持将A账户的某一操作权限分配给他人所拥有的公私钥对或者账户B，从而实现基于角色的权限管理**。

除了两个原生权限以外，`EOS`还支持自定义权限。`active`权限可以看作拥有除了更改`owner`权限外的所有`owner`权限，例如转账、投票、购买ram等权限。我们可以将`active`的部分权限（比如说投票权）分配给一个自定义权限`voting`，且无须`owner`、`active`权限所对应的私钥对投票操作进行签名，单单通过`voting`权限所对应的私钥对投票操作进行签名便可完成投票操作。这就可以将`EOS`账户的部分操作权限分配给第三方，避免直接给出`active`权限的私钥，从而实现灵活和安全的组织管理方式。

在多主体共同控制某一权限的情况下（如多对`EOS`公私钥共同控制`ower`权限），如何判定，或者说在何种条件下就拥有了该账户的某一权限？`EOS`是通过权重和阈值来实现的。账户可给每个主体（如每对`EOS`公私钥)分配不同的权重，以及拥有该权限的阈值，只有当某些人拥有的公私钥数量所对应的权重之和不低于该权限的阈值时，才能拥有该权限，并进行相应操作。

![An image](/img/chain/eosio/04.png)

上表中，该账户的`owner`权限由 EOS2Ca4o... 和 EOS3Q3bx... 公钥所对应的私钥的所有拥有人共同控制，任何一方都不能单独拥有`onwer`权限。因为双方的权重都为1，而`owner`权限的阈值为2，因此只有双方达成一致，一起对交易进行签名才能行使`owner`权限。

而active权限则可由 E0S94x3b... 和 E0S4x112... 任意一方单独行使。

对于自定义权限`voting`，由 EOS7Hnlp... 公钥所对应的私钥拥有的人单独控制，而账户 testaccount1 则需和账户 testaccount2 通过各自的`active`权限结合起来才能共同行使该账户的`voting`权限。

### 强制延迟消息执行策略

时间是安全的关键组成部分。在大多数情况下，不可能知道私钥是否被盗用，直到它被使用。

基于时间的安全机制在人们使用某些应用程序时更为重要，因为这些应用程序需要将密钥保存在日常使用的联网计算机上。消息包含在区块后，**EOS系统软件支持应用程序开发人员指定某些消息在应用前必须等待一小段时间，在此期间可以取消该操作**。当这类消息被广播时，用户可以通过电子邮件或短信收到相应通知。如果用户没有授权，那么他们可以登录账户来还原账户数据并撤回消息。所需的延迟取时间决于操作的敏感程度。支付一杯咖啡可以在几秒钟内确认且不可撤回，而买房子可能需要72小时的清算周期。将整个账户转移到新的用户可能需要30天。具体延迟取决于应用程序开发人员和用户。

该机制的存在可以使开发人员结合具体场景有效保证用户的资产安全。

### 密铜丢失或被盗后的恢复

`EOS`允许恢复被盗窃的密钥，这在比特币和以太坊上是不可能的。在比特币和以太坊上一旦密钥丢失那么整个账户也将随之丢失。

`EOS`系统软件为用户提供了密钥被盗时恢复其账户控制的方法。**账户所有者可以使用过去30天内 活跃的 任何其批准的账户 恢复 合作伙伴的密钥，并重置账户上的所有者密钥。没有账户所有者的配合，账户恢复合作伙伴无法重置账户的控制权**。

对于黑客而言，由于其已经“控制”该账户，因此尝试执行恢复过程没有任何收获。此外，如果黑客执行恢复过程，指定的恢复伙伴可能需要身份认证和多因素认证(电话和电子邮件)。这可能会暴露黑客身份，或者黑客在恢复过程中毫无所得。

这个过程也与简单的多重签名交易有着极大的不同。通过多签名交易，另一个实体会成为每个执行交易的一方。相比之下，通过恢复过程，恢复合作伙伴仅参与恢复过程，无权参与日常交易。这极大降低了所有参与者要付出的成本和相应法律责任。