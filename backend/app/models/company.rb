class Company < ApplicationRecord
  has_many :company_sns, dependent: :destroy
  has_many :campaigns, dependent: :destroy

  validates :name, presence: true
  validates :email, presence: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :contact_name, presence: true
  validates :contact_phone, presence: true
  validates :postal_code, presence: true
  validates :prefecture, presence: true
  validates :city, presence: true
  validates :address1, presence: true

  def full_address
    "#{postal_code} #{prefecture}#{city}#{address1}#{address2}"
  end
end