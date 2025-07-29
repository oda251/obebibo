class Admin::ShipmentsController < Admin::ApplicationController
  before_action :set_shipment, only: [:show, :update]

  def index
    @shipments = Shipment.includes(entry: [:user, :campaign], address: :user).recent.page(params[:page]).per(20)
    @shipments = @shipments.where(status: params[:status]) if params[:status].present?
  end

  def show
  end

  def update
    if @shipment.update(shipment_params)
      redirect_to admin_shipment_path(@shipment), notice: '配送状況が更新されました'
    else
      render :show
    end
  end

  private

  def set_shipment
    @shipment = Shipment.find(params[:id])
  end

  def shipment_params
    params.require(:shipment).permit(:status, :shipped_at)
  end
end