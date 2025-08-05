class Api::Admin::ShipmentsController < Api::ApplicationController
  before_action :authenticate_admin!
  before_action :set_shipment, only: [:show, :update]

  def index
    @shipments = Shipment.includes(entry: [:user, :campaign], address: :user).recent.page(params[:page]).per(params[:per_page] || 20)
    @shipments = @shipments.where(status: params[:status]) if params[:status].present?
    
    render json: {
      shipments: @shipments.map { |s| shipment_json(s) },
      total: @shipments.total_count,
      page: @shipments.current_page,
      per_page: @shipments.limit_value
    }
  end

  def show
    render json: { shipment: shipment_detail_json(@shipment) }
  end

  def update
    if @shipment.update(shipment_params)
      render_success({ shipment: shipment_json(@shipment) }, '配送状況が更新されました')
    else
      render_error(@shipment.errors.full_messages.join(', '))
    end
  end

  private

  def set_shipment
    @shipment = Shipment.find(params[:id])
  end

  def shipment_params
    params.require(:shipment).permit(:status, :shipped_at)
  end

  def shipment_json(shipment)
    {
      id: shipment.id,
      status: shipment.status,
      shipped_at: shipment.shipped_at,
      created_at: shipment.created_at,
      updated_at: shipment.updated_at,
      user: {
        id: shipment.user.id,
        email: shipment.user.email
      },
      campaign: {
        id: shipment.campaign.id,
        title: shipment.campaign.title
      },
      address: {
        postal_code: shipment.address.postal_code,
        prefecture: shipment.address.prefecture,
        city: shipment.address.city,
        address1: shipment.address.address1,
        address2: shipment.address.address2,
        phone: shipment.address.phone
      }
    }
  end

  def shipment_detail_json(shipment)
    shipment_json(shipment).merge(
      entry: {
        id: shipment.entry.id,
        status: shipment.entry.status,
        created_at: shipment.entry.created_at
      }
    )
  end

  def authenticate_admin!
    render_error('管理者権限が必要です', :unauthorized) unless admin_signed_in?
  end
end