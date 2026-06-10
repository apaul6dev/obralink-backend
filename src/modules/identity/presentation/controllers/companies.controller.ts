import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ActivateCompanyCommand } from '../../application/commands/company/activate-company.command';
import { CreateCompanyAdminCommand } from '../../application/commands/company/create-company-admin.command';
import { CreateCompanyCommand } from '../../application/commands/company/create-company.command';
import { SuspendCompanyCommand } from '../../application/commands/company/suspend-company.command';
import { UpdateCompanyCommand } from '../../application/commands/company/update-company.command';
import { CreateCompanyAdminDto } from '../../application/dto/company/create-company-admin.dto';
import { CreateCompanyDto } from '../../application/dto/company/create-company.dto';
import { UpdateCompanyDto } from '../../application/dto/company/update-company.dto';
import { CompanyIdParamDto } from '../../application/dto/common/request.dto';
import { GetCompanyByIdQuery } from '../../application/queries/company/get-company-by-id.query';
import { GetCompaniesQuery } from '../../application/queries/company/get-companies.query';
import { UserType } from '../../domain/enums/user-type.enum';
import { AuthenticatedIdentity } from '../../domain/services/company-access-policy.service';
import { AuthenticatedIdentityGuard } from '../../infrastructure/security/authenticated-identity.guard';
import { RolesGuard } from '../../infrastructure/security/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { CompanyPresenter } from '../presenters/company.presenter';
import { UserPresenter } from '../presenters/user.presenter';

@Controller('identity/companies')
@UseGuards(AuthenticatedIdentityGuard, RolesGuard)
@ApiTags('Identity - Companies')
@ApiCookieAuth('better-auth-session')
export class CompaniesController {
  constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) {}

  @Post()
  @Roles(UserType.SYSTEM_OWNER)
  @ApiOperation({ summary: 'Create company / Crear empresa' })
  async create(@CurrentUser() currentUser: AuthenticatedIdentity, @Body() payload: CreateCompanyDto) {
    const company = await this.commandBus.execute(new CreateCompanyCommand(currentUser, payload));
    return CompanyPresenter.toHttp(company);
  }

  @Get()
  @Roles(UserType.SYSTEM_OWNER)
  @ApiOperation({ summary: 'List companies / Listar empresas' })
  async findAll(@CurrentUser() currentUser: AuthenticatedIdentity) {
    const companies = await this.queryBus.execute(new GetCompaniesQuery(currentUser));
    return companies.map(CompanyPresenter.toHttp);
  }

  @Get(':companyId')
  @ApiOperation({ summary: 'Get company by id / Obtener empresa por id' })
  async findById(@CurrentUser() currentUser: AuthenticatedIdentity, @Param() params: CompanyIdParamDto) {
    const company = await this.queryBus.execute(new GetCompanyByIdQuery(currentUser, params.companyId));
    return CompanyPresenter.toHttp(company);
  }

  @Patch(':companyId')
  @Roles(UserType.SYSTEM_OWNER)
  @ApiOperation({ summary: 'Update company / Actualizar empresa' })
  async update(@CurrentUser() currentUser: AuthenticatedIdentity, @Param() params: CompanyIdParamDto, @Body() payload: UpdateCompanyDto) {
    const company = await this.commandBus.execute(new UpdateCompanyCommand(currentUser, params.companyId, payload));
    return CompanyPresenter.toHttp(company);
  }

  @Patch(':companyId/activate')
  @Roles(UserType.SYSTEM_OWNER)
  @ApiOperation({ summary: 'Activate company / Activar empresa' })
  async activate(@CurrentUser() currentUser: AuthenticatedIdentity, @Param() params: CompanyIdParamDto) {
    const company = await this.commandBus.execute(new ActivateCompanyCommand(currentUser, params.companyId));
    return CompanyPresenter.toHttp(company);
  }

  @Patch(':companyId/suspend')
  @Roles(UserType.SYSTEM_OWNER)
  @ApiOperation({ summary: 'Suspend company / Suspender empresa' })
  async suspend(@CurrentUser() currentUser: AuthenticatedIdentity, @Param() params: CompanyIdParamDto) {
    const company = await this.commandBus.execute(new SuspendCompanyCommand(currentUser, params.companyId));
    return CompanyPresenter.toHttp(company);
  }

  @Post(':companyId/admin')
  @Roles(UserType.SYSTEM_OWNER)
  @ApiOperation({ summary: 'Create company admin / Crear administrador inicial de empresa' })
  async createAdmin(@CurrentUser() currentUser: AuthenticatedIdentity, @Param() params: CompanyIdParamDto, @Body() payload: CreateCompanyAdminDto) {
    const user = await this.commandBus.execute(new CreateCompanyAdminCommand(currentUser, params.companyId, payload));
    return UserPresenter.toHttp(user);
  }
}
