import ValidateAddressService from '../../app/service/validate-address-service'

const validateAddress = new ValidateAddressService()

describe('Validate Address service', () => {
  it('should dismiss incorrect addresses', () => {
    const incorrectAddresses = [
      '',
      'tohuvabohuo',
      'r0000000000000000000000000000000000',
      'z0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      'rpKUF9qd4PexCvNPbZb12SkiG97zw9rMX4XrpKUF9qd4PexCvNPbZb12SkiG97zw9rMX4X'
    ]

    incorrectAddresses.forEach(address => {
      expect(validateAddress.validate(address)).toBe(false)
    })
  })

  it('should let pass correct addresses', () => {
    const correctAddresses = [
      'rpDZxfbauKpPPrYoucyEGAA3LV7nCPdBgJZ',
      'ztdxc5f6YD6R6kS8PgeGWtmr41GKjjp3duAxHEXZhh3b1gCc96wHYeG4cJGWSDbVa5zEktVZKC26mmA7kvtZ7SPtCiJbHhM'
    ]

    correctAddresses.forEach(address => {
      expect(validateAddress.validate(address)).toBe(true)
    })
  })
})
