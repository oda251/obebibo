class Address < ApplicationRecord
  belongs_to :user
  has_many :shipments, dependent: :destroy

  validates :postal_code, presence: true
  validates :prefecture, presence: true
  validates :city, presence: true
  validates :address1, presence: true
  validates :phone, presence: true

  before_save :ensure_only_one_default, if: :is_default?

  def full_address
    "#{postal_code} #{prefecture}#{city}#{address1}#{address2}"
  end

  private

  def ensure_only_one_default
    user.addresses.where.not(id: id).update_all(is_default: false)
  end
end